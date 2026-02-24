import {
  Annotation, findResourceTarget, findTextPositionSelector,
  isEntity, getEntityType, toClassName, getPageText,
} from '@globalise/annotation';
import {Id} from '@knaw-huc/original-layout';
import {renderLineNumbers} from './renderLineNumbers';
import {renderBlocks} from './renderBlocks';
import {
  FullOriginalLayoutConfig,
  OriginalLayoutConfig,
  renderOriginalLayout,
} from '@knaw-huc/original-layout';
import {orThrow} from '@knaw-huc/original-layout';
import {D3El} from '@knaw-huc/original-layout';
import {View} from '@knaw-huc/original-layout';
import {createRanges} from '@knaw-huc/original-layout';
import {groupRanges} from '@knaw-huc/original-layout';
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
  Partial<FullDiplomaticViewConfig>;

export function renderDiplomaticView(
  $view: HTMLDivElement,
  annotations: Record<Id, Annotation>,
  config: DiplomaticViewConfig,
): View {
  $view.classList.add('original-layout');

  function show() {
    $view.style.visibility = 'visible';
  }

  function hide() {
    $view.style.visibility = 'hidden';
  }

  const {showRegions, showEntities} = {...defaultConfig, ...config};
  $view.innerHTML = '';
  const wordAnnos = Object.values(annotations)
    .filter((a) => a.textGranularity === 'word');
  const fragments = wordAnnos.map(createFragment);
  const originalLayout = renderOriginalLayout($view, fragments, config);
  const {$fragments, scale, offset} = originalLayout;

  const {id: pageAnnoId, text: pageText} = getPageText(annotations);

  const entityAnnos = Object.values(annotations).filter(isEntity);
  const markedAnnos = [...wordAnnos, ...entityAnnos];
  const annoRanges = markedAnnos.map((annotation) => {
    const selector = findTextPositionSelector(annotation, pageAnnoId);
    return {
      begin: selector.start,
      end: selector.end,
      body: annotation,
    };
  });

  const textRanges = createRanges(pageText, annoRanges);
  const groupedByWord = groupRanges(
    textRanges,
    (id: Id) => id.includes('#word_'),
  );

  for (const group of groupedByWord) {
    const $word = $fragments[group.group];
    const $ranges: HTMLSpanElement[] = [];
    for (const range of group.ranges) {
      const $range = document.createElement('span');
      $ranges.push($range);
      $range.classList.add('range');
      $range.textContent = pageText.substring(range.begin, range.end);

      if (showEntities) {
        for (const annoId of range.annotations) {
          const annotation = annotations[annoId];
          if (isEntity(annotation)) {
            const entityType = getEntityType(annotation);
            $range.classList.add(...['entity', toClassName(entityType)]);
            $range.title = `${entityType} | ${annotation.id}`;
          }
        }
      }
    }
    $word.replaceChildren(...$ranges);
  }

  const wordsToLine: Record<Id, Id> = {};
  const linesToBlock: Record<Id, Id> = {};
  const blockToLines: Record<Id, Id[]> = {};
  Object.values(annotations).forEach((anno) => {
    if (anno.textGranularity === 'word') {
      wordsToLine[anno.id] = findResourceTarget(anno).id;
    }
    if (anno.textGranularity === 'line') {
      linesToBlock[anno.id] = findResourceTarget(anno).id;
    }
    if (anno.textGranularity === 'line') {
      const blockId = findResourceTarget(anno).id;
      if (!blockToLines[blockId]) {
        blockToLines[blockId] = [];
      }
      blockToLines[blockId].push(anno.id);
    }
  });

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
      $block.on('mouseenter', () => enterRegion($block, lineIds, blockId));
      $block.on('mouseleave', () => leaveRegion($block, lineIds, blockId));
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

  return {
    selectAnnotation,
    deselectAnnotation,
    hide,
    show,
  };
}
