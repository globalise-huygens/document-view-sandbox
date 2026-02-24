import {Annotation, SpecificResourceTarget} from './AnnoModel';
import {isSpecificResourceTarget} from './isSpecificResourceTarget';
import {TextPositionSelector} from '@iiif/presentation-3';
import {orThrow} from "./orThrow.ts";
import { Id } from './Id.ts';

export function findTextPositionSelector(
  annotation: Annotation,
  targetId: Id,
): TextPositionSelector {
  if (!annotation.target) {
    throw new Error('No target');
  }
  if (!Array.isArray(annotation.target)) {
    throw new Error('Target is not an array');
  }
  const target =
    (annotation.target.find(
      (t) => isSpecificResourceTarget(t) && t.source.id === targetId,
    ) as SpecificResourceTarget) ?? orThrow('No annotation resource target');
  const selector = target.selector;
  if (!Array.isArray(selector)) {
    throw new Error('Array expected');
  }
  return selector.find(isTextPositionSelector) ?? orThrow('No selector');
}

export function isTextPositionSelector(
  toTest: unknown,
): toTest is TextPositionSelector {
  return (toTest as TextPositionSelector).type === 'TextPositionSelector';
}
