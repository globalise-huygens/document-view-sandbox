import {debounce} from 'lodash'

main();

function main() {
  if (!CSS.highlights) {
    console.error('CSS.highlights not supported.');
    return;
  }

  const text = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.';

  const annotations: Annotation[] = [
    {begin: 6, end: 17, body: {id: 'p1', type: 'person'}}, // "ipsum dolor"
    {begin: 12, end: 26, body: {id: 'p2', type: 'person'}}, // "dolor sit amet"
    {begin: 12, end: 21, body: {id: 'p3', type: 'person'}}, // "dolor sit"
    {begin: 28, end: 50, body: {id: 'l1', type: 'location'}}, // "consectetur adipiscing"
    {begin: 40, end: 55, body: {id: 'l2', type: 'location'}}, // "adipiscing elit"
    {begin: 18, end: 39, body: {id: 'e1', type: 'event'}}, // "sit amet, consectetur"
  ];

  const $app = document.querySelector<HTMLDivElement>('#app')
    ?? orThrow('app div not found');

  const $text = document.createElement('div');
  $app.appendChild($text);

  const textNode = document.createTextNode(text);
  $text.replaceChildren(textNode);

  const $style = document.createElement('style');
  document.head.appendChild($style);

  CSS.highlights.clear();

  renderText($style, annotations, textNode);
  handleHovering($text, textNode, annotations);
}

function renderText(
  $style: HTMLStyleElement,
  annotations: Annotation[],
  textNode: Text
) {
  const slicedByOffset = createRanges(textNode, annotations);
  createHighlightStyles(slicedByOffset, annotations, $style);

  for (const [combinationKey, rangeData] of slicedByOffset.entries()) {
    const highlight = new Highlight(...rangeData.ranges);
    CSS.highlights.set(combinationKey, highlight);
  }
}

/**
 * Annotations can overlap, e.g. Aaaa<bc>bbbbb<cd>ccccc</bc>dddd<cd>eeee.
 * To apply the styling of both annotations to an overlapping region,
 * the annotated text is split into ranges, each range linked to all annotations
 * that apply.
 */
function createRanges(
  textNode: Text,
  annotations: Annotation[]
): Map<string, AnnotationsRange> {
  const offsets: Offset[] = [];
  for (const annotation of annotations) {
    offsets.push({charIndex: annotation.begin, type: 'begin', annotation});
    offsets.push({charIndex: annotation.end, type: 'end', annotation});
  }
  offsets.sort((a, b) => a.charIndex - b.charIndex);

  const rangesByAnnotationIds = new Map<string, AnnotationsRange>();
  let activeAnnotations: Annotation[] = [];
  let lastIndex = 0;

  for (const offset of offsets) {
    const currentIndex = offset.charIndex;
    if (currentIndex > lastIndex && activeAnnotations.length > 0) {

      const annotationIds = activeAnnotations
        .map(a => a.body.id)
        .sort();

      const idsKey = annotationIds.join('-');

      if (!rangesByAnnotationIds.has(idsKey)) {
        rangesByAnnotationIds.set(idsKey, {
          ranges: [],
          annotationIds: annotationIds
        });
      }

      const range = new Range();
      range.setStart(textNode, lastIndex);
      range.setEnd(textNode, currentIndex);
      rangesByAnnotationIds.get(idsKey)!.ranges.push(range);
    }
    if (offset.type === 'begin') {
      activeAnnotations.push(offset.annotation);
    } else {
      activeAnnotations = activeAnnotations.filter(a => a !== offset.annotation);
    }
    lastIndex = currentIndex;
  }
  return rangesByAnnotationIds;

}

function createHighlightStyles(
  rangeByIds: Map<string, AnnotationsRange>,
  annotations: Annotation[],
  styleElement: HTMLStyleElement
) {
  let cssRules = `::highlight(hover-highlight) {
      background-color: rgba(0, 0, 0, 0.2);
      cursor: pointer;
    }
  `;

  const annotationById = new Map<AnnotationId, Annotation>();
  for (const annotation of annotations) {
    annotationById.set(annotation.body.id, annotation);
  }

  const pink = {r: 255, g: 182, b: 193};
  const blue = {r: 173, g: 216, b: 230};
  const yellow = {r: 255, g: 255, b: 224};
  const typeColors = {person: pink, location: blue, event: yellow};

  for (const [key, ranges] of rangeByIds.entries()) {
    const types = ranges.annotationIds.map(id =>
      annotationById.get(id)?.body.type ?? orThrow(`id ${id} not found`)
    )
    const color = mergeTypeColors(types, typeColors);

    cssRules += `
      ::highlight(${key}) {
        background-color: ${color};
        border-radius: 2px;
      }
    `;
  }
  styleElement.textContent = cssRules;
}

function handleHovering(
  $text: HTMLDivElement,
  textNode: Text,
  annotations: Annotation[]
) {
  let hoveredAnnotationId: string | null = null;

  const updateHoverHighlight = (newHoverId: string | null) => {
    if (!newHoverId) {
      CSS.highlights.delete('hover-highlight');
      return;
    }
    const toHighlight = annotations.find(a => a.body.id === newHoverId);
    if (!toHighlight) {
      return;
    }

    const range = new Range();
    range.setStart(textNode, toHighlight.begin);
    range.setEnd(textNode, toHighlight.end);

    const hoverHighlight = new Highlight(range);
    CSS.highlights.set('hover-highlight', hoverHighlight);
  };

  const handleAnnotationIdChange = debounce((
    targetAnnotationId: string | null
  ) => {
    if (hoveredAnnotationId !== targetAnnotationId) {
      hoveredAnnotationId = targetAnnotationId;
      updateHoverHighlight(hoveredAnnotationId);
    }
  }, 25);

  $text.addEventListener('mousemove', (event) => {
    const caretInfo = getCaretFromCursor(event.clientX, event.clientY);
    if (caretInfo && caretInfo.node === textNode) {
      const found = findHoveredAnnotation(annotations, caretInfo.offset);
      const targetAnnotationId = found ? found.body.id : null;
      handleAnnotationIdChange(targetAnnotationId);
    }
  });

  $text.addEventListener('mouseleave', () => {
    handleAnnotationIdChange(null);
  });
}

/**
 * Pick an annotation that:
 * 1. contains the character index
 * 2. has the shortest length
 * 3. starts earliest
 */
function findHoveredAnnotation(
  annotations: Annotation[],
  charIndex: number
): Annotation | null {
  const candidates = annotations.filter(a => charIndex >= a.begin && charIndex < a.end);

  if (candidates.length === 0) {
    return null;
  }

  return candidates.reduce((best, current) => {
    const shortest = best.end - best.begin;
    const currentLength = current.end - current.begin;

    if (currentLength < shortest) {
      return current;
    }

    if (currentLength === shortest && current.begin < best.begin) {
      return current;
    }

    return best;
  });
}

function getCaretFromCursor(
  x: number,
  y: number
): { node: Node; offset: number } | undefined {
  const position = document.caretPositionFromPoint(x, y);
  if (!position) {
    return;
  }
  return {
    node: position.offsetNode,
    offset: position.offset
  };
}

export type AnnotationId = string;
export type AnnotationType = 'location' | 'person' | 'event';
type AnnotationBody = {
  id: AnnotationId;
  type: AnnotationType;
};

export type Annotation = {
  begin: number;
  end: number;
  body: AnnotationBody;
};
type AnnotationsRange = {
  ranges: Range[];
  annotationIds: AnnotationId[];
};

type Offset = {
  charIndex: number;
  type: "begin" | "end";
  annotation: Annotation
};

function orThrow(msg: string): never {
  throw new Error(msg);
}

// ---

function mergeTypeColors(
  types: AnnotationType[],
  baseColors: Record<AnnotationType, Rgb>
) {
  const baseAlpha = 0.4;
  const uniqueTypes = new Set(types);

  let rSum = 0;
  let gSum = 0;
  let bSum = 0;
  for (const type of uniqueTypes) {
    const color = baseColors[type]
      ?? orThrow(`type ${type} not found`);
    rSum += color.r;
    gSum += color.g;
    bSum += color.b;
  }
  const r = Math.round(rSum / uniqueTypes.size);
  const g = Math.round(gSum / uniqueTypes.size);
  const b = Math.round(bSum / uniqueTypes.size);
  const alpha = Math.min(1, baseAlpha + (0.1 * types.length));
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

type Rgb = {
  r: number,
  g: number,
  b: number
};
