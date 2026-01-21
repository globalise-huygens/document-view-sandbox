import { Annotation, AnnotationPage, PartOf } from '../AnnoModel';
import { Id } from '../Id';

export function mapAnnotationsById(annotations: Annotation[]) {
  return annotations.reduce(
    (prev, curr) => {
      prev[curr.id] = curr;
      return prev;
    },
    {} as Record<Id, Annotation>,
  );
}
