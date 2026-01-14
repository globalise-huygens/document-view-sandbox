import { Annotation } from './AnnoModel';
import { Id } from './Id';
import { Point } from './Point';
import { findResourceTarget } from './findResourceTarget';
import { orThrow } from '../util/orThrow';
import { createPoints } from './createPoints';
import { findSvgPath } from './anno/findSvgPath';

export function createBlockBoundaries(
  words: Annotation[],
  annotations: Record<Id, Annotation>,
) {
  const blockBoundaries: Record<Id, Point[]> = {};
  for (const word of words) {
    const line = annotations[findResourceTarget(word).id];
    const block = annotations[findResourceTarget(line).id];
    if (!blockBoundaries[block.id]) {
      blockBoundaries[block.id] = [];
    }
    const wordPoints = createPoints(findSvgPath(word));
    blockBoundaries[block.id].push(...wordPoints);
  }
  return blockBoundaries;
}
