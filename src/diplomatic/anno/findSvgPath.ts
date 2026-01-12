import type { Annotation } from '../AnnoModel';
import { isEmpty } from 'lodash';
import { isSpecificResourceTarget } from './isSpecificResourceTarget';
import { assertSpecificResourceTarget } from './assertSpecificResourceTarget';
import { assertSvgSelector } from './assertSvgSelector';
import { parseSvgPath } from './parseSvgPath';
export type SvgPath = string;

export function findSvgPath(annotation: Annotation): SvgPath {
  if (!annotation.target || isEmpty(annotation.target)) {
    throw new Error('Annotation missing target');
  }
  const target = Array.isArray(annotation.target)
    ? annotation.target.find(isSpecificResourceTarget)
    : annotation.target;
  assertSpecificResourceTarget(target);
  const selector = target.selector;
  assertSvgSelector(selector);
  return parseSvgPath(selector.value);
}
