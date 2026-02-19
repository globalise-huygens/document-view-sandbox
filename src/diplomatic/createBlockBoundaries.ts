import {Annotation} from './anno/AnnoModel';
import {Id} from './anno/Id';
import {Point} from './Point';
import {findResourceTarget} from './anno/findResourceTarget';
import {createPoints} from './createPoints';
import {findSvgPath} from './anno/findSvgPath';

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
    const fragmentPoints = createPoints(findSvgPath(word));
    blockBoundaries[block.id].push(...fragmentPoints);
  }
  return blockBoundaries;
}
