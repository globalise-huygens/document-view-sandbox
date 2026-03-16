import {Annotation} from "./AnnoModel.ts";
import {getBody} from "./getBody.ts";
import {assertEntityBody} from "./EntityModel.ts";

export function getEntityType(entity: Annotation) {
  const body = getBody(entity);
  assertEntityBody(body);
  return body.classified_as._label;
}
