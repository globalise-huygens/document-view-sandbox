import {AnnotationResourceTarget, AnnotationTarget} from "../AnnoModel";

export function isAnnotationResourceTarget(toTest: AnnotationTarget): toTest is AnnotationResourceTarget {
  const typed = toTest as AnnotationResourceTarget
  if (typed.type !== "Annotation") {
    return false;
  }
  if (!typed.id) {
    return false;
  }
  return true;
}