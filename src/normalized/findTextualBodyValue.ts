import {Annotation} from "../diplomatic/AnnoModel";
import {assertTextualBody} from "../diplomatic/anno/assertTextualBody";

export function findTextualBodyValue(annotation: Annotation) {
  const {body: bodies} = annotation;
  const body = Array.isArray(bodies) ? bodies[0] : bodies
  assertTextualBody(body)
  return body.value;
}