import type {Annotation} from "../AnnoModel";

export function isBlock(annotation: Annotation) {
  return annotation.textGranularity === 'block';
}