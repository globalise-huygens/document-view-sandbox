import {select} from 'd3-selection';
import {D3El, Id} from '@knaw-huc/original-layout';
import {segment, TextSegment} from '@knaw-huc/text-annotation-segmenter';
import {
  Annotation, createAnnotationSegments,
  getEntityType,
  getPageText,
  isEntity, orThrow, toClassName
} from '@globalise/common/annotation';
import {indexTextGranularity} from '@globalise/common/annotation';
import {noop} from "@globalise/common";

export type NormalizedLayoutConfig = {
  onHover?: (id: Id | null) => void;
  onClick?: (id: Id) => void;
};

export type NormalizedLayoutResult = {
  $segments: Record<Id, HTMLElement>;
  $lines: Record<Id, HTMLElement>;
  $overlay: SVGSVGElement;
  segments: TextSegment<Annotation>[];
};

const defaultConfig = {onClick: noop, onHover: noop};

export function renderNormalizedLayout(
  $parent: HTMLElement,
  annotations: Record<Id, Annotation>,
  config?: NormalizedLayoutConfig,
): NormalizedLayoutResult {
  const {onClick, onHover} = {...defaultConfig, ...config};

  const $view = document.createElement('div');
  $parent.append($view);
  $view.classList.add('normalized-view');

  const {id: pageAnnoId, text: pageText} = getPageText(annotations);

  const wordAnnos = Object.values(annotations).filter(
    (a) => a.textGranularity === 'word',
  );
  const entityAnnos = Object.values(annotations).filter(isEntity);
  const markedAnnos = [...wordAnnos, ...entityAnnos];

  const annoSegments = createAnnotationSegments(markedAnnos, pageAnnoId);
  const segments = segment<Annotation>(pageText, annoSegments);
  const {wordsToLine} = indexTextGranularity(annotations);

  const segmentsByLine: Record<Id, TextSegment<Annotation>[]> = {};
  let lastLineId: Id | null = null;
  for (const segment of segments) {
    const word = segment.annotations.find((a) => a.id in wordsToLine);
    const lineId: Id | null = word ? wordsToLine[word.id] : lastLineId;
    if (!lineId) {
      continue;
    }
    lastLineId = lineId;
    if (!segmentsByLine[lineId]) {
      segmentsByLine[lineId] = [];
    }
    segmentsByLine[lineId].push(segment);
  }

  const $text = document.createElement('div');
  $view.appendChild($text);
  $text.classList.add('text');

  const $segments: Record<Id, HTMLSpanElement> = {};
  const $lines: Record<Id, HTMLElement> = {};

  const lines = Object.keys(segmentsByLine);
  for (const [i, lineId] of lines.entries()) {
    const lineSegments = segmentsByLine[lineId];
    const $line = document.createElement('span');
    $line.classList.add('line');

    const $number = document.createElement('span');
    $number.classList.add('line-number');
    $number.textContent = `${i + 1}`.padStart(2, ' ');
    $line.append($number);

    const $content = document.createElement('span');
    $content.classList.add('line-content');
    $line.append($content);

    for (const segment of lineSegments) {
      const $segment = document.createElement('span');
      $segment.classList.add('segment');
      $segment.textContent = pageText.substring(segment.begin, segment.end);
      for (const annotation of segment.annotations) {
        if (isEntity(annotation)) {
          const entityType = getEntityType(annotation);
          $segment.classList.add(...['entity', toClassName(entityType)]);
          $segment.title = `${entityType} | ${annotation.id}`;
        }
      }

      const word = segment.annotations
        .find(a => a.textGranularity === 'word');

      if (word) {
        $segment.addEventListener('mouseenter', () => onHover(word.id));
        $segment.addEventListener('mouseleave', () => onHover(null));
        $segment.addEventListener('click', () => onClick(word.id));
      }

      $segments[segment.id] = $segment;
      $content.appendChild($segment);
    }
    $lines[lineId] = $line;
  }

  $text.append(...Object.values($lines));

  const $overlay: D3El<SVGSVGElement> = select($view)
    .append('svg')
    .attr('class', 'overlay');

  return {
    $segments,
    $lines,
    segments,
    $overlay: $overlay.node() ?? orThrow('No svg element'),
  };
}