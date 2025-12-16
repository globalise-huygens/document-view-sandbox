import { SpecificResourceTarget } from '../AnnoModel';
import { isSpecificResourceTarget } from './isSpecificResourceTarget';

export function assertSpecificResourceTarget(
  target: unknown,
): asserts target is SpecificResourceTarget {
  if (!isSpecificResourceTarget(target)) {
    throw new Error('Expected SpecificResourceTarget');
  }
}
