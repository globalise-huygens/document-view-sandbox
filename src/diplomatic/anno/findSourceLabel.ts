import {Annotation, isBlockWithLabel} from "../AnnoModel";

export function findSourceLabel(annotation: Annotation) {
  const body = Array.isArray(annotation.body) ? annotation.body[0] : annotation.body
  return isBlockWithLabel(body) ? body.source.label : 'no label';
}