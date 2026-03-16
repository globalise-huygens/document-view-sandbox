import {Annotation} from './AnnoModel';
import {Id} from './Id';
import {findResourceTarget} from "./findResourceTarget.ts";

export type TextGranularityIndex = {
  wordsToLine: Record<Id, Id>;
  linesToBlock: Record<Id, Id>;
  blockToLines: Record<Id, Id[]>;
  wordToBlock: Record<Id, Id>;
};

export function indexTextGranularity(
  annotations: Record<Id, Annotation>
): TextGranularityIndex {
  const wordsToLine: Record<Id, Id> = {};
  const linesToBlock: Record<Id, Id> = {};
  const blockToLines: Record<Id, Id[]> = {};

  for (const anno of Object.values(annotations)) {
    if (anno.textGranularity === 'word') {
      wordsToLine[anno.id] = findResourceTarget(anno).id;
    }
    if (anno.textGranularity === 'line') {
      const blockId = findResourceTarget(anno).id;
      linesToBlock[anno.id] = blockId;
      if (!blockToLines[blockId]) {
        blockToLines[blockId] = [];
      }
      blockToLines[blockId].push(anno.id);
    }
  }

  const wordToBlock: Record<Id, Id> = {};
  for (const [wordId, lineId] of Object.entries(wordsToLine)) {
    const blockId = linesToBlock[lineId];
    if (blockId) {
      wordToBlock[wordId] = blockId;
    }
  }

  return {wordsToLine, linesToBlock, blockToLines, wordToBlock};
}