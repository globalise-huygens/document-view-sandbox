import {SpecificResourceTarget} from './AnnoModel';

export const isSpecificResourceTarget = (
  target: unknown,
): target is SpecificResourceTarget =>
  !!target &&
  (target as SpecificResourceTarget).type === 'SpecificResource' &&
  !!(target as SpecificResourceTarget).source &&
  !!(target as SpecificResourceTarget).selector;
