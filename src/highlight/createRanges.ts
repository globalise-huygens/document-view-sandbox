import { AnnotationRange, AnnotationId, TextRange } from './Model';
import { RangeId } from './Model';

/**
 * Split a text into character ranges linked to the annotations that apply to that range.
 *
 * Annotations can overlap, e.g. Aaaa<bc>bbbbb<cd>ccccc</bc>dddd<cd>eeee.
 * To apply the styling of both annotations to an overlapping region,
 * the annotated text is split into ranges, each range linked to all annotations that apply.
 */
export function createRanges(
  text: string,
  annotations: AnnotationRange[],
): Map<RangeId, TextRange> {
  const ranges = new Map<RangeId, TextRange>();
  let rangeCounter = 0;

  const offsetMap = new Map<number, AnnotationRangesByChar>();

  const getOrCreateOffset = (charIndex: number) => {
    if (offsetMap.has(charIndex)) {
      return offsetMap.get(charIndex)!;
    }
    const newOffset = { charIndex, starting: [], ending: [] };
    offsetMap.set(charIndex, newOffset);
    return newOffset;
  };

  getOrCreateOffset(0);
  getOrCreateOffset(text.length);

  annotations.forEach((a) => {
    getOrCreateOffset(a.begin).starting.push(a);
    getOrCreateOffset(a.end).ending.push(a);
  });

  const sortedOffsets = [...offsetMap.values()].sort(
    (a, b) => a.charIndex - b.charIndex,
  );

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

    /**
     * marker: annotation with a location and without any content
     */
    const markers = offset.starting.filter((a) => offset.ending.includes(a));
    for (const marker of markers) {
      const range = `${rangeCounter++}` as RangeId;
      ranges.set(range, {
        id: range,
        begin: offset.charIndex,
        end: offset.charIndex,
        annotations: [marker.body.id, ...activeAnnotations],
      });
    }

    offset.starting.forEach((a) => activeAnnotations.add(a.body.id));
    offset.ending.forEach((a) => activeAnnotations.delete(a.body.id));
    lastOffset = offset.charIndex;
  }

  return ranges;
}

/**
 * Intermediate type to annotations to the
 * character indexes at which they start or end
 */
export type AnnotationRangesByChar = {
  charIndex: number;
  starting: AnnotationRange[];
  ending: AnnotationRange[];
};
