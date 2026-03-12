import {select} from 'd3-selection';
import {D3El, Id} from '@knaw-huc/original-layout';
import {segment, TextSegment} from '@knaw-huc/text-annotation-segmenter';
import {
  Annotation, createAnnotationRanges,
  findResourceTarget,
  getEntityType,
  getPageText,
  isEntity, orThrow, toClassName
} from '@globalise/common/annotation';

export type NormalizedLayoutConfig = {
  onHover?: (id: Id | null) => void;
  onClick?: (id: Id) => void;
};

export type NormalizedLayoutResult = {
  $ranges: Record<Id, HTMLElement>;
  $lines: Record<Id, HTMLElement>;
  $overlay: SVGSVGElement;
  ranges: TextSegment<Annotation>[];
};

const noop = () => {
};
const defaultConfig = {onClick: noop, onHover: noop};

export function renderNormalizedLayout(
  $parent: HTMLElement,
  annotations: Record<Id, Annotation>,
  config?: NormalizedLayoutConfig,
): NormalizedLayoutResult {
  const {onClick, onHover} = config ?? defaultConfig

  const $view = document.createElement('div');
  $parent.append($view);
  $view.classList.add('normalized-view');

  const {id: pageAnnoId, text: pageText} = getPageText(annotations);

  const wordAnnos = Object.values(annotations).filter(
    (a) => a.textGranularity === 'word',
  );
  const entityAnnos = Object.values(annotations).filter(isEntity);
  const markedAnnos = [...wordAnnos, ...entityAnnos];

  const annoRanges = createAnnotationRanges(markedAnnos, pageAnnoId);

  const ranges = segment<Annotation>(pageText, annoRanges);

  const wordsToLine: Record<Id, Id> = {};
  for (const wordAnno of wordAnnos) {
    wordsToLine[wordAnno.id] = findResourceTarget(wordAnno).id;
  }

  const rangesByLine: Record<Id, TextSegment<Annotation>[]> = {};
  let lastLineId: Id | null = null;
  for (const range of ranges) {
    const word = range.annotations.find((a) => a.id in wordsToLine);
    const lineId: Id | null = word ? wordsToLine[word.id] : lastLineId;
    if (!lineId) {
      continue;
    }
    lastLineId = lineId;
    if (!rangesByLine[lineId]) {
      rangesByLine[lineId] = [];
    }
    rangesByLine[lineId].push(range);
  }

  const $text = document.createElement('div');
  $view.appendChild($text);
  $text.classList.add('text');

  const $ranges: Record<Id, HTMLSpanElement> = {};
  const $lines: Record<Id, HTMLElement> = {};

  const lines = Object.keys(rangesByLine);
  for (const [i, lineId] of lines.entries()) {
    const lineRanges = rangesByLine[lineId];
    const $line = document.createElement('span');
    $line.classList.add('line');

    const $number = document.createElement('span');
    $number.classList.add('line-number');
    $number.textContent = `${i + 1}`.padStart(2, ' ');
    $line.append($number);

    const $content = document.createElement('span');
    $content.classList.add('line-content');
    $line.append($content);

    for (const range of lineRanges) {
      const $range = document.createElement('span');
      $range.classList.add('range');
      $range.textContent = pageText.substring(range.begin, range.end);
      for (const annotation of range.annotations) {
        if (isEntity(annotation)) {
          const entityType = getEntityType(annotation);
          $range.classList.add(...['entity', toClassName(entityType)]);
          $range.title = `${entityType} | ${annotation.id}`;
        }
      }

      const word = range.annotations
        .find(a => a.textGranularity === 'word');

      if (onHover && word) {
        $range.addEventListener('mouseenter', () => onHover(word.id));
        $range.addEventListener('mouseleave', () => onHover(null));
      }

      if (onClick && word) {
        $range.addEventListener('click', () => onClick(word.id));
      }

      $ranges[range.id] = $range;
      $content.appendChild($range);
    }
    $lines[lineId] = $line;
  }

  $text.append(...Object.values($lines));

  const $overlay: D3El<SVGSVGElement> = select($view)
    .append('svg')
    .attr('class', 'overlay');

  return {
    $ranges,
    $lines,
    ranges,
    $overlay: $overlay.node() ?? orThrow('No svg element'),
  };
}