import { create } from "zustand";
import type OpenSeadragon from "openseadragon";

interface ViewerState {
  viewer: OpenSeadragon.Viewer | null;
  setViewer: (viewer: OpenSeadragon.Viewer | null) => void;
}

export const useViewerStore = create<ViewerState>((set) => ({
  viewer: null,
  setViewer: (viewer) => set({ viewer }),
}));
