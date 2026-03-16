import {Annotation, findTextPositionSelector} from "@globalise/annotation";
import {AnnotationSegment} from "@knaw-huc/text-annotation-segmenter";

/**
 * Create annotation ranges from annotation text position selectors
 * linking to {@link pageAnnoId}.
 * When selector not found, log and skip annotation
 */
export function createAnnotationRanges(
  markedAnnos: Annotation[],
  pageAnnoId: string
): AnnotationSegment<Annotation>[] {
  return markedAnnos.map((annotation) => {
    try {
      const selector = findTextPositionSelector(annotation, pageAnnoId);
      return {
        begin: selector.start,
        end: selector.end,
        body: annotation,
      };
    } catch (error) {
      const context = {error, annotation, pageAnnoId};
      console.debug('Skipping annotation', annotation.id, context)
      return;
    }
  }).filter(range => !!range);
}