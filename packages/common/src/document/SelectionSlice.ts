import {useDocumentStore, DocumentState} from './DocumentStore';
import {Id} from "../annotation";

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
  currentId: Id,
  selectedId: Id | null,
  s: DocumentState,
): boolean {
  if (!selectedId) {
    return false;
  }
  if (currentId === selectedId) {
    return true;
  }
  if (currentId === s.textGranularity.wordToBlock[selectedId]) {
    return true;
  }
  if (currentId === s.entityOverlap.entityToBlock[selectedId]) {
    return true;
  }
  return false;
}

function isSelectedInFacsimile(
  currentId: Id,
  selectedId: Id | null,
  s: DocumentState,
): boolean {
  if (!selectedId) {
    return false;
  }
  if (currentId === selectedId) {
    return true;
  }
  if (currentId === s.textGranularity.wordToBlock[selectedId]) {
    return true;
  }
  /**
   * Highlight related words when current is entity:
   */
  const wordIds = s.entityOverlap.entityToWords[selectedId];
  if (wordIds && wordIds.includes(currentId)) {
    return true;
  }
  if (currentId === s.entityOverlap.entityToBlock[selectedId]) {
    return true;
  }
  return false;
}

export function useIsSelectedInTranscription(
  id: Id
): boolean {
  return useDocumentStore(s =>
    isSelectedInTranscription(id, s.hoveredId, s)
    || isSelectedInTranscription(id, s.clickedId, s)
  );
}

export function useIsSelectedInFacsimile(
  id: Id
): boolean {
  return useDocumentStore(s =>
    isSelectedInFacsimile(id, s.hoveredId, s)
    || isSelectedInFacsimile(id, s.clickedId, s)
  );
}