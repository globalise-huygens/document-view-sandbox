import type {Annotation} from "../AnnoModel";

export function isWord(annotation: Annotation) {
  return annotation.textGranularity === 'word';
}