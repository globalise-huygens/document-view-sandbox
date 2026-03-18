import {create} from 'zustand';
import {Id} from './annotation';

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
