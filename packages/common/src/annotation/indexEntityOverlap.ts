import {Id} from './Id';
import {Annotation} from './AnnoModel';
import {isEntity} from './EntityModel';
import {findTextPositionSelector} from './findTextPositionSelector';

export type EntityOverlapIndex = {
  entityToWords: Record<Id, Id[]>;
  entityToBlock: Record<Id, Id>;
};

const emptyIndex: EntityOverlapIndex = {
  entityToWords: {},
  entityToBlock: {},
};

export function indexEntityOverlap(
  annotations: Record<Id, Annotation>,
  pageAnnoId: Id,
  wordToBlock: Record<Id, Id>,
): EntityOverlapIndex {
  const entityToWords: Record<Id, Id[]> = {};
  const entityToBlock: Record<Id, Id> = {};

  const wordSelectors: { id: Id; start: number; end: number }[] = [];
  for (const annotation of Object.values(annotations)) {
    if (annotation.textGranularity === 'word') {
      const {start, end} = findTextPositionSelector(annotation, pageAnnoId);
      wordSelectors.push({id: annotation.id, start, end});
    }
  }
  if (!wordSelectors.length) {
    return emptyIndex;
  }
  for (const entity of Object.values(annotations)) {
    if (!isEntity(entity)) {
      continue;
    }

    const {start, end} = findTextPositionSelector(entity, pageAnnoId);
    const overlapping = wordSelectors
      .filter(word => word.start < end && word.end > start)
      .map(w => w.id);

    if (!overlapping.length) {
      continue;
    }
    entityToWords[entity.id] = overlapping;

    // Pick block by first overlapping word:
    const blockId = wordToBlock[overlapping[0]];
    if (blockId) {
      entityToBlock[entity.id] = blockId;
    }
  }

  return {entityToWords, entityToBlock};
}
