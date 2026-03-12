import { Annotation } from './AnnoModel';
import { Id } from './Id';
import { findResourceTarget } from './findResourceTarget';

export type TextGranularityRecords = {
  wordToLine: Record<Id, Id>;
  lineToBlock: Record<Id, Id>;
  blockToLines: Record<Id, Id[]>;
};

export function linkTextGranularityAnnotations(
  annotations: Record<Id, Annotation>
): TextGranularityRecords {
  const wordToLine: Record<Id, Id> = {};
  const lineToBlock: Record<Id, Id> = {};
  const blockToLines: Record<Id, Id[]> = {};

  for (const anno of Object.values(annotations)) {
    if (anno.textGranularity === 'word') {
      wordToLine[anno.id] = findResourceTarget(anno).id;
    }
    if (anno.textGranularity === 'line') {
      const blockId = findResourceTarget(anno).id;
      lineToBlock[anno.id] = blockId;
      if (!blockToLines[blockId]) {
        blockToLines[blockId] = [];
      }
      blockToLines[blockId].push(anno.id);
    }
  }

  return { wordToLine, lineToBlock, blockToLines };
}