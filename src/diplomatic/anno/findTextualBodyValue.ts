import {Annotation} from "../AnnoModel";
import {assertTextualBody} from "./assertTextualBody";

export function findTextualBodyValue(annotation: Annotation) {
  const { body: bodies } = annotation;
  const body = Array.isArray(bodies) ? bodies[0] : bodies;
  assertTextualBody(body);
  return body.value;
}
