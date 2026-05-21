import {Annotation, findTextPositionSelector} from "@globalise/common/annotation";

/**
 * Filter annotations with a valid text position selector linking to {@link pageAnnoId}.
 * When selector not found, log and skip annotation.
 */
export function filterAnnotationsWithSelector(
  annotations: Annotation[],
  pageAnnoId: string,
): Annotation[] {
  return annotations.filter((annotation) => {
      const found = findTextPositionSelector(annotation, pageAnnoId);
      if(!found) {
        const context = { annotation, pageAnnoId };
        console.debug('Skipping: no text position selector', context);
        return false;
      }
      return true;
  });
}