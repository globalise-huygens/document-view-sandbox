import {
  Annotation, buildAnnotationHierarchy,
  createAnnotationRanges,
  getEntityType,
  getPageText,
  isEntity,
  toClassName,
} from '@globalise/common/annotation';
import {View} from '@globalise/common';
import {
  D3El,
  FullOriginalLayoutConfig,
  Id,
  OriginalLayoutConfig,
  orThrow,
  renderOriginalLayout
} from '@knaw-huc/original-layout';
import {groupSegments, segment} from '@knaw-huc/text-annotation-segmenter';
import {renderLineNumbers} from './renderLineNumbers';
import {renderBlocks} from './renderBlocks';
import {createFragment} from './createFragment.ts';

export type FullDiplomaticViewConfig = FullOriginalLayoutConfig & {
  showRegions: boolean;
  showEntities: boolean;
};

export const defaultConfig: FullDiplomaticViewConfig = {
  showBoundaries: false,
  showScanMargin: false,
  fit: 'width',
  page: {
    height: 0,
    width: 0,
  },
  showRegions: false,
  showEntities: false,
};

export type DiplomaticViewConfig = OriginalLayoutConfig &
  Partial<FullDiplomaticViewConfig> & {
  onHover?: (id: Id | null) => void;
  onClick?: (id: Id) => void;
};

export function renderDiplomaticView(
  $view: HTMLDivElement,
  annotations: Record<Id, Annotation>,
  config: DiplomaticViewConfig,
): View {
  $view.classList.add('original-layout');

  const mergedConfig = {
    onHover: () => {
    }, ...defaultConfig, ...config
  };
  const {showRegions, showEntities, onHover, onClick} = mergedConfig;
  $view.innerHTML = '';
  const wordAnnos = Object.values(annotations)
    .filter((a) => a.textGranularity === 'word');
  const fragments = wordAnnos.map(createFragment);
  const originalLayout = renderOriginalLayout($view, fragments, config);
  const {$fragments, scale, offset} = originalLayout;

  const {id: pageAnnoId, text: pageText} = getPageText(annotations);

  const entityAnnos = Object.values(annotations).filter(isEntity);
  const markedAnnos = [...wordAnnos, ...entityAnnos];
  const annoRanges = createAnnotationRanges(markedAnnos, pageAnnoId);

  const textSegments = segment<Annotation>(pageText, annoRanges);
  const groupedByWord = groupSegments(
    textSegments,
    (a) => a.textGranularity === 'word',
  );

  const {
    wordsToLine,
    linesToBlock,
    blockToLines
  } = buildAnnotationHierarchy(annotations);

  for (const group of groupedByWord) {
    const $word = $fragments[group.annotation.id];
    const $ranges: HTMLSpanElement[] = [];
    for (const range of group.segments) {
      const $range = document.createElement('span');
      $ranges.push($range);
      $range.classList.add('range');
      $range.textContent = pageText.substring(range.begin, range.end);

      if (showEntities) {
        for (const annotation of range.annotations) {
          if (isEntity(annotation)) {
            const entityType = getEntityType(annotation);
            $range.classList.add(...['entity', toClassName(entityType)]);
            $range.title = `${entityType} | ${annotation.id}`;
          }
        }
      }

      $range.addEventListener('mouseenter', () => onHover(group.annotation.id));
      $range.addEventListener('mouseleave', () => onHover(null));
      if (onClick) {
        $range.addEventListener('click', () => onClick(group.annotation.id));
      }
    }
    $word.replaceChildren(...$ranges);
  }

  const selectedRegions = new Set<Id>();
  let selectRegion: (id: Id) => void = () => console.warn('Not implemented');
  let deselectRegion: (id: Id) => void = () => console.warn('Not implemented');

  if (showRegions) {
    const {$blocks} = renderBlocks(annotations, $view, {scale, offset});
    const lineNumbers = renderLineNumbers(annotations, $view, {scale, offset});
    const {showLine, hideLine} = lineNumbers;

    function showRegion($block: D3El<SVGGElement>, lines: Id[]) {
      $block.attr('opacity', 1);
      lines.forEach((l) => showLine(l));
    }

    function hideRegion($block: D3El<SVGGElement>, lines: Id[]) {
      $block.attr('opacity', 0);
      lines.forEach((l) => hideLine(l));
    }

    function enterRegion($block: D3El<SVGGElement>, lines: Id[], id: Id) {
      if (selectedRegions.has(id)) {
        return;
      }
      showRegion($block, lines);
    }

    function leaveRegion($block: D3El<SVGGElement>, lines: Id[], id: Id) {
      if (selectedRegions.has(id)) {
        return;
      }
      hideRegion($block, lines);
    }

    for (const [wordId, $word] of Object.entries($fragments)) {
      const blockId = linesToBlock[wordsToLine[wordId]];
      const lineIds = blockToLines[blockId];
      const $block = $blocks[blockId];
      $word.addEventListener('mouseenter', () =>
        enterRegion($block, lineIds, blockId),
      );
      $word.addEventListener('mouseleave', () =>
        leaveRegion($block, lineIds, blockId),
      );
    }

    for (const [blockId, $block] of Object.entries($blocks)) {
      const lineIds = blockToLines[blockId];
      $block.on('mouseenter', () => {
        enterRegion($block, lineIds, blockId);
        onHover(blockId);
      });
      $block.on('mouseleave', () => {
        leaveRegion($block, lineIds, blockId);
        onHover(null);
      });
    }

    selectRegion = (id: Id) => {
      const $block = $blocks[id];
      if (!$block) {
        return;
      }
      if (selectedRegions.has(id)) {
        return;
      }
      selectedRegions.add(id);
      const lines = blockToLines[id];
      showRegion($block, lines);
    };
    deselectRegion = (id: Id) => {
      const $block = $blocks[id];
      if (!$block) {
        return;
      }
      if (!selectedRegions.has(id)) {
        return;
      }
      selectedRegions.delete(id);
      const lines = blockToLines[id];
      hideRegion($block, lines);
    };
  }

  function selectAnnotation(id: Id) {
    const annotation = annotations[id] ?? orThrow('Not found');
    if (annotation.textGranularity === 'word') {
      const $word = $fragments[id];
      $word.classList.add('selected');
    } else if (annotation.textGranularity === 'block') {
      selectRegion(id);
    } else {
      console.warn(`Select not implemented: ${annotation.textGranularity}`);
    }
  }

  function deselectAnnotation(id: Id) {
    const annotation = annotations[id] ?? orThrow('Not found');
    if (annotation.textGranularity === 'word') {
      const $word = $fragments[id];
      $word.classList.remove('selected');
    } else if (annotation.textGranularity === 'block') {
      deselectRegion(id);
    } else {
      console.warn(`Deselect not implemented: ${annotation.textGranularity}`);
    }
  }

  const selectedIds: Id[] = [];

  return {
    setSelected: (...ids: string[]) => {
      const selected = ids.filter(id => !selectedIds.includes(id));
      const deselected = selectedIds.filter(id => !ids.includes(id));

      selected.forEach(id => selectAnnotation(id));
      deselected.forEach(id => deselectAnnotation(id));

      selectedIds.length = 0;
      selectedIds.push(...ids);
    }
  };
}
