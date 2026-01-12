import type { Annotation } from '../AnnoModel';

export function isLine(annotation: Annotation) {
  return annotation.textGranularity === 'line';
}
