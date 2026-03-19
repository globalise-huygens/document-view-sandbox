import {
  Annotation,
  createAnnotationSegments,
  getEntityType,
  getPageText,
  indexTextGranularity,
  isEntity,
  toClassName,
} from '@globalise/common/annotation';
import {noop, orThrow, View} from '@globalise/common';
import {
  D3El,
  FullOriginalLayoutConfig,
  Id,
  OriginalLayoutConfig,
  px,
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

  const $layoutView = document.createElement('div');
  $view.appendChild($layoutView);
  if (showBlocks) {
    $layoutView.classList.add('with-blocks')
  }

  const wordAnnos = Object.values(annotations)
    .filter((a) => a.textGranularity === 'word');
  const fragments = wordAnnos.map(createFragment);
  const originalLayout = renderOriginalLayout($layoutView, fragments, config);
  const {$fragments, scale, offset} = originalLayout;

  const {id: pageAnnoId, text: pageText} = getPageText(annotations);

  const entityAnnos = Object.values(annotations).filter(isEntity);
  const markedAnnos = [...wordAnnos, ...entityAnnos];
  const annoSegments = createAnnotationSegments(markedAnnos, pageAnnoId);

  const textSegments = segment<Annotation>(pageText, annoSegments);
  const groupedByWord = groupSegments(
    textSegments,
    (a) => a.textGranularity === 'word',
  );

  const {blockToLines, wordToBlock} = indexTextGranularity(annotations);
  const $entityToSegments: Record<Id, HTMLSpanElement[]> = {};

  for (const wordGroup of groupedByWord) {
    const wordId = wordGroup.annotation.id;
    const $word = $fragments[wordId];
    const $segments: HTMLSpanElement[] = [];

    for (const segment of wordGroup.segments) {
      const $segment = document.createElement('span');
      $segments.push($segment);
      $segment.classList.add('segment');
      $segment.textContent = pageText.substring(segment.begin, segment.end);
      const entityAnno = segment.annotations.find(a => isEntity(a));

      if (entityAnno) {
        const entityType = getEntityType(entityAnno);
        $segment.classList.add(...['entity', toClassName(entityType)]);
        $segment.title = `${entityType} | ${entityAnno.id}`;

        if (!$entityToSegments[entityAnno.id]) {
          $entityToSegments[entityAnno.id] = [];
        }
        $entityToSegments[entityAnno.id].push($segment);

        $segment.addEventListener('click', () => onClick(entityAnno.id));
        $segment.addEventListener('mouseenter', () => onHover(entityAnno.id));
        $segment.addEventListener('mouseleave', () => onHover(null));
      } else {
        const blockId = wordToBlock[wordId];
        $segment.addEventListener('click', () => onClick(wordId));
        $segment.addEventListener('mouseenter', () => onHover(wordId));
        $segment.addEventListener('mouseleave', () => onHover(blockId ?? null));
      }
    }
    $word.replaceChildren(...$segments);
  }

  const selectedBlocks = new Set<Id>();
  let selectBlock: (id: Id) => void = () => console.warn('Not implemented');
  let deselectBlock: (id: Id) => void = () => console.warn('Not implemented');

  if (showBlocks) {
    const lineCount = Object.values(annotations)
      .filter(a => a.textGranularity === 'line').length;
    const digitCount = String(lineCount).length;
    const lineNumberGap = scale(30);
    const lineNumberWidth = lineNumberGap + scale(30 * digitCount);

    $layoutView.style.width = `calc(100% - ${lineNumberWidth}px)`;
    $layoutView.style.marginLeft = px(lineNumberWidth);

    const {$blocks} = renderBlocks(annotations, $layoutView, {scale, offset});
    const lineNumbers = renderLineNumbers(annotations, $view, {
      scale, gap: lineNumberGap, offset: {
        left: offset.left + lineNumberWidth,
        top: offset.top
      },
    });
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
      const $segments = $entityToSegments[id];
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
      const $segments = $entityToSegments[id];
      $segments.forEach($r => $r.classList.remove('selected'));
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