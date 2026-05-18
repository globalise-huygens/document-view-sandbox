import type { Annotation } from './AnnoModel';
import { asArray } from './asArray.ts';
import { isSpecificResourceTarget } from './isSpecificResourceTarget.ts';
import { isSvgSelector } from './isSvgSelector.ts';

export type SvgPath = string;

export function findSvgPath(annotation: Annotation): SvgPath | undefined {
  if (!annotation.target || !annotation.target.length) {
    return undefined;
  }
  const targets = asArray(annotation.target);
  const resourceTarget = targets.find((t) => isSpecificResourceTarget(t));
  if (!resourceTarget) {
    return;
  }
  const selector = resourceTarget.selector;
  if (!isSvgSelector(selector)) {
    return;
  }
  return selector.value;
}
