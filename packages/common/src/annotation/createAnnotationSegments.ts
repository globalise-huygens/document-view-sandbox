import {Annotation, findTextPositionSelector} from "@globalise/common/annotation";
import {AnnotationOffsets} from "@knaw-huc/text-annotation-segmenter";

/**
 * Create annotation ranges from annotation text position selectors linking to {@link pageAnnoId}.
 * When selector not found, log and skip annotation
 */
export function createAnnotationSegments(
  markedAnnos: Annotation[],
  pageAnnoId: string
): AnnotationOffsets<Annotation>[] {
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