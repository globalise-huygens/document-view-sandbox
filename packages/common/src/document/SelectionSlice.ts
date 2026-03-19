import {useDocumentStore, DocumentState} from './DocumentStore';
import {Id} from "../annotation/Id.ts";

export type SelectionSlice = {
  hoveredId: Id | null;
  clickedId: Id | null;
};

export const defaultSelectionSlice: SelectionSlice = {
  hoveredId: null,
  clickedId: null,
};

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
  useDocumentStore.setState({hoveredId: null, clickedId: null});
}

function isSelectedInTranscription(
  id: Id,
  activeId: Id | null,
  s: DocumentState,
): boolean {
  if (!activeId) {
    return false;
  }
  if (id === activeId) {
    return true;
  }
  if (id === s.textGranularity.wordToBlock[activeId]) {
    return true;
  }
  if (id === s.entityOverlap.entityToBlock[activeId]) {
    return true;
  }
  return false;
}

function isSelectedInFacsimile(
  id: Id,
  activeId: Id | null,
  s: DocumentState,
): boolean {
  if (!activeId) {
    return false;
  }
  if (id === activeId) {
    return true;
  }
  if (id === s.textGranularity.wordToBlock[activeId]) {
    return true;
  }
  const wordIds = s.entityOverlap.entityToWords[activeId];
  if (wordIds && wordIds.includes(id)) {
    return true;
  }
  if (id === s.entityOverlap.entityToBlock[activeId]) {
    return true;
  }
  return false;
}

export function useIsSelectedInTranscription(id: Id): boolean {
  return useDocumentStore(s =>
    isSelectedInTranscription(id, s.hoveredId, s)
    || isSelectedInTranscription(id, s.clickedId, s)
  );
}

export function useIsSelectedInFacsimile(id: Id): boolean {
  return useDocumentStore(s =>
    isSelectedInFacsimile(id, s.hoveredId, s)
    || isSelectedInFacsimile(id, s.clickedId, s)
  );
}