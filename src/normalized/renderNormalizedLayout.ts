import {select} from 'd3-selection';
import {orThrow} from '../util/orThrow';
import {createRanges, D3El, Id, TextRange} from "@knaw-huc/original-layout";
import {
  Annotation, findResourceTarget, findTextPositionSelector, getEntityType,
  getPageText,
  isEntity, toClassName
} from "@knaw-huc/original-layout/diplomatic";

export type NormalizedLayoutResult = {
  $ranges: Record<Id, HTMLElement>;
  $lines: Record<Id, HTMLElement>;
  $overlay: SVGSVGElement;
  ranges: TextRange[];
};

export function renderNormalizedLayout(
  $parent: HTMLElement,
  annotations: Record<Id, Annotation>,
): NormalizedLayoutResult {
  const $view = document.createElement('div');
  $parent.append($view);
  $view.classList.add('normalized-view');

  const {id: pageAnnoId, text: pageText} = getPageText(annotations);

  const wordAnnos = Object.values(annotations).filter(
    (a) => a.textGranularity === 'word',
  );
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

  const ranges = [...Object.values(createRanges(pageText, annoRanges))];

  const wordsToLine: Record<Id, Id> = {};
  for (const wordAnno of wordAnnos) {
    wordsToLine[wordAnno.id] = findResourceTarget(wordAnno).id;
  }

  const rangesByLine: Record<Id, TextRange[]> = {};
  let lastLineId: Id | null = null;
  for (const range of ranges) {
    const wordId = range.annotations.find((id) => id in wordsToLine);
    const lineId: Id | null = wordId ? wordsToLine[wordId] : lastLineId;
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
      for (const annoId of range.annotations) {
        const annotation = annotations[annoId];
        if (isEntity(annotation)) {
          const entityType = getEntityType(annotation);
          $range.classList.add(...['entity', toClassName(entityType)]);
          $range.title = `${entityType} | ${annotation.id}`;
        }
      }
      $ranges[range.id] = $range;
      $content.appendChild($range);
    }
    $lines[lineId] = $line;
  }

  $text.append(...Object.values($lines));

  const {width, height} = $view.getBoundingClientRect();
  const $overlay: D3El<SVGSVGElement> = select($view)
    .append('svg')
    .attr('class', 'overlay')
    .attr('width', width)
    .attr('height', height);

  return {
    $ranges,
    $lines,
    ranges,
    $overlay: $overlay.node() ?? orThrow('No svg element'),
  };
}