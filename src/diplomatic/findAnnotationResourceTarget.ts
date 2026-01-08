import {Annotation, AnnotationResourceTarget} from "./AnnoModel";
import {isAnnotationResourceTarget} from "./anno/isAnnotationResourceTarget";
import {orThrow} from "../util/orThrow";

export function findAnnotationResourceTarget(
  annotation: Annotation
):AnnotationResourceTarget  {
  if(!annotation.target) {
    throw new Error('No target')
  }
  if(!Array.isArray(annotation.target)) {
    throw new Error('Target is not an array')
  }
  return annotation.target.find(t => isAnnotationResourceTarget(t))
    ?? orThrow('No annotation resource target found');
}