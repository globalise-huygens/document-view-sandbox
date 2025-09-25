import {debounce, keyBy} from 'lodash'

main();

function main() {
  const text = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.';

  const annotations: Annotation[] = [
    {begin: 6, end: 17, body: {id: 'p1', type: 'person'}}, // "ipsum dolor"
    {begin: 12, end: 12, body: {id: 'n2', type: 'note', note: 'A note here'}},
    {begin: 12, end: 21, body: {id: 'p3', type: 'person'}}, // "dolor sit"
    {begin: 12, end: 26, body: {id: 'p2', type: 'person'}}, // "dolor sit amet"
    {begin: 18, end: 39, body: {id: 'e1', type: 'event'}}, // "sit amet, consectetur"
    {begin: 28, end: 50, body: {id: 'l1', type: 'location'}}, // "consectetur adipiscing"
    {begin: 40, end: 55, body: {id: 'l2', type: 'location'}}, // "adipiscing elit"
  ];

  const $app = document.querySelector<HTMLDivElement>('#app')
    ?? orThrow('app div not found');

  const $text = document.createElement('div');
  $app.appendChild($text);

  const $style = document.createElement('style');
  document.head.appendChild($style);

  const rangesById = createRanges(text, annotations);
  const annotationById = keyBy(annotations, a => a.body.id);

  renderText($style, $text, text, [...rangesById.values()], annotationById);
  handleHovering($text, rangesById, annotationById);
}

/**
 * Annotations can overlap, e.g. Aaaa<bc>bbbbb<cd>ccccc</bc>dddd<cd>eeee.
 * To apply the styling of both annotations to an overlapping region,
 * the annotated text is split into ranges, each range linked to all annotations
 * that apply.
 */
function createRanges(
  text: string,
  annotations: Annotation[]
): Map<RangeId, Range> {
  const ranges = new Map<RangeId, Range>();
  let rangeCounter = 0;

  const offsetMap = new Map<number, Offset>();

  const getOrCreateOffset = (charIndex: number) => {
    if (offsetMap.has(charIndex)) {
      return offsetMap.get(charIndex)!;
    }
    const newOffset = {charIndex, starting: [], ending: [], markers: []}
    offsetMap.set(charIndex, newOffset);
    return newOffset;
  }

  getOrCreateOffset(0);
  getOrCreateOffset(text.length);

  annotations.forEach(a => {
    if (a.begin === a.end) {
      getOrCreateOffset(a.begin).markers.push(a);
    } else {
      getOrCreateOffset(a.begin).starting.push(a);
      getOrCreateOffset(a.end).ending.push(a);
    }
  });

  const sortedOffsets = [...offsetMap.values()]
    .sort((a, b) => a.charIndex - b.charIndex);

  const activeAnnotations = new Set<AnnotationId>();
  let lastOffset = 0;
  for (const offset of sortedOffsets) {
    if (offset.charIndex > lastOffset) {
      const id = `${rangeCounter++}` as RangeId;
      ranges.set(id, {
        id,
        begin: lastOffset,
        end: offset.charIndex,
        annotations: [...activeAnnotations],
      });
    }

    for (const marker of offset.markers) {
      const range = `${rangeCounter++}` as RangeId;
      ranges.set(range, {
        id: range,
        begin: offset.charIndex,
        end: offset.charIndex,
        annotations: [marker.body.id, ...activeAnnotations],
      });
    }

    offset.starting.forEach(a => activeAnnotations.add(a.body.id));
    offset.ending.forEach(a => activeAnnotations.delete(a.body.id));
    lastOffset = offset.charIndex;
  }

  return ranges;
}

function renderText(
  $style: HTMLStyleElement,
  $container: HTMLDivElement,
  text: string,
  ranges: Range[],
  annotations: Record<AnnotationId, Annotation>
) {
  createHighlightStyles(annotations, ranges, $style);

  const sortedByBegin = [...ranges]
    .sort((a, b) => a.begin - b.begin);

  for (const range of sortedByBegin) {
    const $span = document.createElement('span');
    $span.textContent = text.substring(range.begin, range.end);
    $span.dataset.range = range.id;

    const classList: string[] = [];
    if (range.begin !== range.end && range.annotations.length) {
      const key = createHighlightClass(range.annotations, annotations);
      classList.push(`highlight-${key}`);
    }
    range.annotations.forEach(id => classList.push(id));

    if (range.begin === range.end) {
      classList.push('marker-range');
    }

    $span.className = classList.join(' ');
    $container.appendChild($span);
  }
}

function createHighlightStyles(
  annotationsById: Record<AnnotationId, Annotation>,
  ranges: Range[],
  styleElement: HTMLStyleElement
) {
  let cssRules = `.highlight-hover {
      background-color: rgba(0, 0, 0, 0.2) !important;
      cursor: pointer;
    }
    
    .marker-range {
      display: inline-block;
      width: 0;
      position: relative;
    }
    .marker-range::before {
      content: '📍';
      position: absolute;
      left: -0.8em;
      top:-1.5em
    }
  `;

  const pink = {r: 255, g: 182, b: 193};
  const blue = {r: 173, g: 216, b: 230};
  const yellow = {r: 255, g: 255, b: 224};
  const colors = {person: pink, location: blue, event: yellow, note: yellow}

  const rangeToColors = new Map<string, string>();
  for (const range of ranges) {

    if (!range.annotations.length) {
      continue;
    }
    if (range.begin === range.end) {
      continue;
    }

    const {key, color} = createHighlight(
      range.annotations,
      annotationsById,
      colors
    );
    rangeToColors.set(key, color);
  }

  for (const [key, color] of rangeToColors) {
    cssRules += `
      .highlight-${key} {
        background-color: ${color};
        border-radius: 2px;
      }
    `;
  }

  styleElement.textContent = cssRules;
}

function handleHovering(
  $text: HTMLDivElement,
  textRanges: Map<RangeId, Range>,
  annotations: Record<AnnotationId, Annotation>
) {
  let currentHoveredAnnotation: AnnotationId | null = null;

  const setHoverHighlight = (annotationId: AnnotationId | null) => {
    $text.querySelectorAll('.highlight-hover').forEach(el => {
      el.classList.remove('highlight-hover');
    });

    if (annotationId) {
      $text.querySelectorAll(`.${annotationId}`).forEach(el => {
        el.classList.add('highlight-hover');
      });
    }
    currentHoveredAnnotation = annotationId;
  };

  const handleRangeHover = debounce((range: RangeId | null) => {
    if (!range) {
      setHoverHighlight(null);
      return;
    }

    const textRange = textRanges.get(range);
    if (!textRange?.annotations.length) {
      setHoverHighlight(null);
      return;
    }

    const candidateAnnotations = textRange.annotations
      .map(id => annotations[id])
      .filter((a): a is Annotation => a !== undefined);

    const found = findHoveredAnnotation(candidateAnnotations, textRange.begin);
    const foundId = found?.body.id;

    if (foundId !== currentHoveredAnnotation) {
      setHoverHighlight(foundId);
    }
  }, 25);

  $text.addEventListener('mouseover', (event) => {
    const target = event.target as HTMLElement;
    if (target.tagName !== 'SPAN') {
      return;
    }
    const range = target.dataset.range ?? null
    handleRangeHover(range);
  });

  $text.addEventListener('mouseleave', () => {
    handleRangeHover(null);
  });
}

/**
 * Find annotation that:
 * 1. contains the character index
 * 2. has the shortest length
 * 3. starts earliest
 */
function findHoveredAnnotation(
  annotations: Annotation[],
  charIndex: number
): Annotation | null {
  const candidates = annotations.filter(a => {
    const marker = a.begin === a.end && charIndex === a.begin;
    const annotation = charIndex >= a.begin && charIndex < a.end;
    return marker || annotation
  });
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

function createHighlightClass(
  annotationIds: AnnotationId[],
  annotations: Record<AnnotationId, Annotation>,
  sortedTypes: AnnotationType[] = ['event', 'location', 'note', 'person']
) {
  const {typeCounts} = countTypes(annotationIds, annotations);
  const parts: string[] = [];

  for (const type of sortedTypes) {
    const count = typeCounts.get(type);
    if (count) {
      const typeKey = type.charAt(0);
      parts.push(`${count}${typeKey}`);
    }
  }
  return parts.join('-');
}

function createHighlight(
  annotationIds: AnnotationId[],
  annotations: Record<AnnotationId, Annotation>,
  baseColors: Record<AnnotationType, Rgb>
) {
  const {types} = countTypes(annotationIds, annotations);
  const color = mergeTypeColors(types, baseColors);
  const key = createHighlightClass(annotationIds, annotations);
  return {key, color};
}

function countTypes(
  annotationIds: AnnotationId[],
  annotations: Record<AnnotationId, Annotation>
): { types: AnnotationType[], typeCounts: Map<AnnotationType, number> } {

  const typeCounts = new Map<AnnotationType, number>();
  const types: AnnotationType[] = [];

  for (const id of annotationIds) {
    const annotation = annotations[id];
    if (!annotation) {
      continue;
    }
    const type = annotation.body.type;
    typeCounts.set(type, (typeCounts.get(type) || 0) + 1);
    types.push(type);
  }

  if (types.includes('note')) {
    throw new Error('Notes are not part of ranges with a stylable length');
  }
  return {types, typeCounts};
}

function orThrow(msg: string): never {
  throw new Error(msg);
}

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
    const color = baseColors[type] ?? orThrow(`type ${type} not found`);
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

type AnnotationId = string;
type AnnotationType = 'location' | 'person' | 'event' | 'note';
type AnnotationBody = EntityBody | NoteBody;
type EntityBody = {
  id: AnnotationId;
  type: 'location' | 'person' | 'event';
};

type NoteBody = {
  id: AnnotationId;
  type: 'note';
  note: string;
};

type Annotation = {
  begin: number;
  end: number;
  body: AnnotationBody;
};

type RangeId = string;
type Range = {
  id: RangeId;
  begin: number;
  end: number;
  annotations: AnnotationId[];
};


type Offset = {
  charIndex: number;
  starting: Annotation[]
  ending: Annotation[]
  /**
   * Annotations with a location, without content
   */
  markers: Annotation[]
};

type Rgb = {
  r: number,
  g: number,
  b: number
};
