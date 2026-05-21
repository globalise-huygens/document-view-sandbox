import {createPoints, Id, orThrow } from "@knaw-huc/original-layout";
import {Point} from "@knaw-huc/original-layout";
import {
  Annotation,
  findResourceTarget,
  findSvgPath,
  parseSvgPath
} from '@globalise/common/annotation';

export function createBlockBoundaries(
  words: Annotation[],
  annotations: Record<Id, Annotation>,
) {
  const blockBoundaries: Record<Id, Point[]> = {};
  for (const word of words) {
    const wordTarget = findResourceTarget(word) || orThrow('No word target');
    const line = annotations[wordTarget.id];
    const lineTarget = findResourceTarget(line) || orThrow('No word target');
    const block = annotations[lineTarget.id];
    if (!blockBoundaries[block.id]) {
      blockBoundaries[block.id] = [];
    }
    const svgPath = findSvgPath(word) || orThrow('No svg path');
    const fragmentPoints = createPoints(parseSvgPath(svgPath));
    blockBoundaries[block.id].push(...fragmentPoints);
  }
  return blockBoundaries;
}
