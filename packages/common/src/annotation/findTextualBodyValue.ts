import { Annotation } from './AnnoModel';
import { isTextualBody } from './isTextualBody.ts';

export function findTextualBodyValue(
  annotation: Annotation,
): string | undefined {
  const { body: bodies } = annotation;
  const body = Array.isArray(bodies) ? bodies[0] : bodies;
  if (!isTextualBody(body)) {
    return;
  }
  return body.value;
}
