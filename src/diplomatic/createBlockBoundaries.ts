import {Annotation} from "./AnnoModel";
import {Id} from "./Id";
import {Point} from "./Point";
import {findAnnotationResourceTarget} from "./findAnnotationResourceTarget";
import {orThrow} from "../util/orThrow";
import {createPoints} from "./createPoints";
import {findSvgPath} from "./anno/findSvgPath";

export function createBlockBoundaries(
  wordAnnos: Annotation[],
  lineToBlock: Record<string, string>
) {
  const blockBoundaries: Record<Id, Point[]> = {};
  for (const wordAnno of wordAnnos) {
    const line = findAnnotationResourceTarget(wordAnno);
    const blockId = lineToBlock[line.id] ?? orThrow(`No line ${line.id}`);
    if (!blockBoundaries[blockId]) {
      blockBoundaries[blockId] = [];
    }
    const wordPoints = createPoints(findSvgPath(wordAnno));
    blockBoundaries[blockId].push(...wordPoints);
  }
  return blockBoundaries;
}