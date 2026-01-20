import {Annotation} from "./AnnoModel";
import {assertEntityBody} from "./EntityModel";

export function getEntityType(entity: Annotation) {
  const body = Array.isArray(entity.body) ? entity.body[0] : entity.body
  assertEntityBody(body)
  return body.classified_as._label;
}