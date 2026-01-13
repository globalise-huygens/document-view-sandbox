import {Annotation} from "./AnnoModel";
import {Id} from "./Id";
import {findAnnotationResourceTarget} from "./findAnnotationResourceTarget";

/**
 * Map every annotation to their parent target resource annotation
 */
// TODO: return parent linked to all children: Record<Id, Annotation[]>
export function linkAnnotationResources(
  lineAnnos: Annotation[]
): Record<Id, Id> {
  const lineToBlock: Record<Id, Id> = {};
  for (const line of lineAnnos) {
    const block = findAnnotationResourceTarget(line);
    lineToBlock[line.id] = block.id;
  }
  return lineToBlock;
}