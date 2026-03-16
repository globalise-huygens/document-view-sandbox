import { useMemo } from 'react';
import { segment, TextSegment } from '@knaw-huc/text-annotation-segmenter';
import {
  Annotation,
  createAnnotationSegments,
  getPageText,
  Id,
  indexTextGranularity,
  isEntity,
} from '@globalise/common/annotation';

export type LineSegments = {
  pageText: string;
  lineIds: Id[];
  segmentsByLine: Record<Id, TextSegment<Annotation>[]>;
  linesToBlock: Record<Id, Id>;
};

export function useLineSegments(
  annotations: Record<Id, Annotation>,
): LineSegments {
  return useMemo(() => {
    const { id: pageAnnoId, text: pageText } = getPageText(annotations);

    const wordAnnos = Object.values(annotations).filter(
      (a) => a.textGranularity === 'word',
    );
    const entityAnnos = Object.values(annotations).filter(isEntity);
    const annos = [...wordAnnos, ...entityAnnos];

    const annoSegments = createAnnotationSegments(annos, pageAnnoId);
    const segments = segment<Annotation>(pageText, annoSegments);
    const { wordsToLine, linesToBlock } = indexTextGranularity(annotations);

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

    const lineIds = Object.keys(segmentsByLine);

    return { pageText, lineIds, segmentsByLine, linesToBlock };
  }, [annotations]);
}