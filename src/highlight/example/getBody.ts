import {Annotation} from "../../diplomatic/AnnoModel";

export function getBody(a: Annotation) {
  return Array.isArray(a.body) ? a.body[0] : a.body;
}