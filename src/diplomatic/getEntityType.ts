import { Annotation } from './AnnoModel';
import { assertEntityBody } from './EntityModel';
import {getBody} from "../highlight/example/getBody";

export function getEntityType(entity: Annotation) {
  const body = getBody(entity)
  assertEntityBody(body);
  return body.classified_as._label;
}
