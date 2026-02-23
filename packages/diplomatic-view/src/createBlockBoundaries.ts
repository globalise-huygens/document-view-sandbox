import {Annotation} from './anno/AnnoModel';
import {findResourceTarget} from './anno/findResourceTarget';
import {findSvgPath} from './anno/findSvgPath';
import {createPoints, Id} from "@knaw-huc/original-layout";
import {Point} from "@knaw-huc/original-layout";
import {parseSvgPath} from "./anno/parseSvgPath.ts";

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
    const fragmentPoints = createPoints(parseSvgPath(findSvgPath(word)));
    blockBoundaries[block.id].push(...fragmentPoints);
  }
  return blockBoundaries;
}
