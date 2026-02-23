import type {Annotation} from './AnnoModel';
import {isSpecificResourceTarget} from './isSpecificResourceTarget';
import {assertSpecificResourceTarget} from './assertSpecificResourceTarget';
import {assertSvgSelector} from './assertSvgSelector';

export type SvgPath = string;

export function findSvgPath(annotation: Annotation): SvgPath {
  if (!annotation.target || !annotation.target.length) {
    throw new Error('Annotation missing target');
  }
  const target = Array.isArray(annotation.target)
    ? annotation.target.find(isSpecificResourceTarget)
    : annotation.target;
  assertSpecificResourceTarget(target);
  const selector = target.selector;
  assertSvgSelector(selector);
  return selector.value;
}
