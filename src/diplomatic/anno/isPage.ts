import type {Annotation} from "../AnnoModel";

export function isPage(annotation: Annotation) {
  return annotation.textGranularity === 'page';
}