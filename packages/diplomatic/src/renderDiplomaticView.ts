import {
  Annotation, indexTextGranularity,
  createAnnotationSegments,
  getEntityType,
  getPageText,
  isEntity,
  toClassName,
} from '@globalise/common/annotation';
import {noop, orThrow, View} from '@globalise/common';
import {
  D3El,
  FullOriginalLayoutConfig,
  Id,
  OriginalLayoutConfig,
  renderOriginalLayout
} from '@knaw-huc/original-layout';
import {groupSegments, segment} from '@knaw-huc/text-annotation-segmenter';
import {renderLineNumbers} from './renderLineNumbers';
import {renderBlocks} from './renderBlocks';
import {createFragment} from './createFragment.ts';

export type FullDiplomaticViewConfig = FullOriginalLayoutConfig & {
  showBlocks: boolean;
};

export const defaultConfig: FullDiplomaticViewConfig = {
  showBoundaries: false,
  showScanMargin: false,
  fit: 'width',
  page: {
    height: 0,
    width: 0,
  },
  showBlocks: false,
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
    onHover: noop, onClick: noop, ...defaultConfig, ...config
  };
  const {showBlocks, onHover, onClick} = mergedConfig;
  $view.innerHTML = '';
  const wordAnnos = Object.values(annotations)
    .filter((a) => a.textGranularity === 'word');
  const fragments = wordAnnos.map(createFragment);
  const originalLayout = renderOriginalLayout($view, fragments, config);
  const {$fragments, scale, offset} = originalLayout;

  const {id: pageAnnoId, text: pageText} = getPageText(annotations);

  const entityAnnos = Object.values(annotations).filter(isEntity);
  const markedAnnos = [...wordAnnos, ...entityAnnos];
  const annoRanges = createAnnotationSegments(markedAnnos, pageAnnoId);

  const textSegments = segment<Annotation>(pageText, annoRanges);
  const groupedByWord = groupSegments(
    textSegments,
    (a) => a.textGranularity === 'word',
  );

  const {blockToLines} = indexTextGranularity(annotations);
  const $entityToRanges: Record<Id, HTMLSpanElement[]> = {};

  for (const group of groupedByWord) {
    const $word = $fragments[group.annotation.id];
    const $segments: HTMLSpanElement[] = [];

    for (const segment of group.segments) {
      const $segment = document.createElement('span');
      $segments.push($segment);
      $segment.classList.add('range');
      $segment.textContent = pageText.substring(segment.begin, segment.end);
      const entityAnno = segment.annotations.find(a => isEntity(a));

      if (entityAnno) {
        const entityType = getEntityType(entityAnno);
        $segment.classList.add(...['entity', toClassName(entityType)]);
        $segment.title = `${entityType} | ${entityAnno.id}`;

        if (!$entityToRanges[entityAnno.id]) {
          $entityToRanges[entityAnno.id] = [];
        }
        $entityToRanges[entityAnno.id].push($segment);

        $segment.addEventListener('click', () => onClick(entityAnno.id));
        $segment.addEventListener('mouseenter', () => onHover(entityAnno.id));
        $segment.addEventListener('mouseleave', () => onHover(null));
      }
    }
    $word.replaceChildren(...$segments);
  }

  const selectedBlocks = new Set<Id>();
  let selectBlock: (id: Id) => void = () => console.warn('Not implemented');
  let deselectBlock: (id: Id) => void = () => console.warn('Not implemented');

  if (showBlocks) {
    const {$blocks} = renderBlocks(annotations, $view, {scale, offset});
    const lineNumbers = renderLineNumbers(annotations, $view, {scale, offset});
    const {showLine, hideLine} = lineNumbers;

    function showBlock($block: D3El<SVGGElement>, lines: Id[]) {
      $block.attr('opacity', 1);
      lines.forEach((l) => showLine(l));
    }

    function hideBlock($block: D3El<SVGGElement>, lines: Id[]) {
      $block.attr('opacity', 0);
      lines.forEach((l) => hideLine(l));
    }

    for (const [blockId, $block] of Object.entries($blocks)) {
      $block.on('mouseenter', () => onHover(blockId));
      $block.on('mouseleave', () => onHover(null));
    }

    selectBlock = (id: Id) => {
      const $block = $blocks[id];
      if (!$block) {
        return;
      }
      if (selectedBlocks.has(id)) {
        return;
      }
      selectedBlocks.add(id);
      const lines = blockToLines[id];
      showBlock($block, lines);
    };
    deselectBlock = (id: Id) => {
      const $block = $blocks[id];
      if (!$block) {
        return;
      }
      if (!selectedBlocks.has(id)) {
        return;
      }
      selectedBlocks.delete(id);
      const lines = blockToLines[id];
      hideBlock($block, lines);
    };
  }

  function selectAnnotation(id: Id) {
    const annotation = annotations[id] ?? orThrow('Not found');
    if (annotation.textGranularity === 'word') {
      const $word = $fragments[id];
      $word.classList.add('selected');
    } else if (annotation.textGranularity === 'block') {
      selectBlock(id);
    } else if (isEntity(annotation)) {
      const $segments = $entityToRanges[id];
      $segments.forEach($r => $r.classList.add('selected'));
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
      deselectBlock(id);
    } else if (isEntity(annotation)) {
      const $ranges = $entityToRanges[id];
      // TODO: should this happen?
      if (!$ranges) {
        return;
      }
      $ranges.forEach($r => $r.classList.remove('selected'));
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