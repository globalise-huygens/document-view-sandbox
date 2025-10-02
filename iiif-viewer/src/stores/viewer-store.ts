import { create } from "zustand";
import type OpenSeadragon from "openseadragon";

interface ViewerState {
  viewer: OpenSeadragon.Viewer | null;
  setViewer: (viewer: OpenSeadragon.Viewer | null) => void;
  viewerReady: boolean;
  setViewerReady: (viewerReady: boolean) => void;
}

export const useViewerStore = create<ViewerState>((set) => ({
  viewer: null,
  viewerReady: false,
  setViewer: (viewer) => set({ viewer }),
  setViewerReady: (viewerReady) => set({ viewerReady }),
}));
