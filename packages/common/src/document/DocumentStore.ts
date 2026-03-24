import {create} from 'zustand';
import {PagesSlice, defaultPagesSlice} from './PagesSlice';
import {SelectionSlice, defaultSelectionSlice} from './SelectionSlice';

export type DocumentState = PagesSlice & SelectionSlice;

export const useDocumentStore = create<DocumentState>(() => ({
  ...defaultPagesSlice,
  ...defaultSelectionSlice,
}));
