import {create} from 'zustand';
import {useMemo} from 'react';
import {Id} from './annotation/Id';
import {useTextGranularity, useEntityOverlap} from './annotation/PageStore';

type DocumentState = {
  hoveredId: Id | null;
  clickedId: Id | null;
};

const defaultState: DocumentState = {
  hoveredId: null,
  clickedId: null,
};

export const useDocumentStore = create<DocumentState>(() => defaultState);

export function setHovered(id: Id | null) {
  useDocumentStore.setState({hoveredId: id});
}

export function toggleClicked(id: Id) {
  const {clickedId} = useDocumentStore.getState();
  useDocumentStore.setState({
    clickedId: id === clickedId ? null : id,
  });
}

export function clearSelection() {
  useDocumentStore.setState(defaultState);
}

export function useSelectedIds(): Id[] {
  const {hoveredId, clickedId} = useDocumentStore();
  const {wordToBlock} = useTextGranularity();
  const {entityToWords, entityToBlock} = useEntityOverlap();

  return useMemo(() => {
    const result = new Set<Id>();
    if (hoveredId) {
      result.add(hoveredId);
      const blockFromWord = wordToBlock[hoveredId];
      if (blockFromWord) {
        result.add(blockFromWord);
      }
      const wordIds = entityToWords[hoveredId];
      if (wordIds) {
        wordIds.forEach(w => result.add(w));
        const blockFromEntity = entityToBlock[hoveredId];
        if (blockFromEntity) {
          result.add(blockFromEntity);
        }
      }
    }
    if (clickedId) {
      result.add(clickedId);
      const wordIds = entityToWords[clickedId];
      if (wordIds) {
        wordIds.forEach(w => result.add(w));
      }
    }
    return [...result];
  }, [clickedId, hoveredId, wordToBlock, entityToWords, entityToBlock]);
}