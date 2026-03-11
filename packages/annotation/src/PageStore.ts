import {useMemo} from 'react';
import {create} from 'zustand';
import {Id} from "./Id.ts";
import {Annotation, AnnotationPage, PartOf} from "./AnnoModel.ts";

export type PageState = {
  canvasId: Id | null;
  pages: AnnotationPage[];
  isLoading: boolean;
  error: string | null;
};

const defaultState: PageState = {
  canvasId: null,
  pages: [],
  isLoading: false,
  error: null,
};

let currentRequest: Id | null = null;

export const usePageStore = create<
  PageState & { load: (canvasId: Id, urls: string[]) => Promise<void> }
>((set) => ({
  ...defaultState,

  load: async (canvasId, urls) => {
    currentRequest = canvasId;
    set({...defaultState, canvasId, isLoading: true});

    if (urls.length === 0) {
      set({canvasId, pages: [], isLoading: false});
      return;
    }

    try {
      const pages: AnnotationPage[] = await Promise.all(
        urls.map(url => fetch(url).then(r => r.json()))
      ) as AnnotationPage[];

      if (currentRequest !== canvasId) {
        return;
      }

      set({pages, isLoading: false});
    } catch (e) {
      if (currentRequest === canvasId) {
        const error = e instanceof Error ? e.message : 'Unknown error';
        set({isLoading: false, error});
      }
    }
  },
}));

export function usePages() {
  const state = usePageStore();
  const isReady = state.canvasId && !state.isLoading && !state.error;
  return {...state, isReady};
}

export function useLoadPages() {
  return usePageStore((s) => s.load);
}

export function useAnnotations(): Record<Id, Annotation> | null {
  const {pages, isReady} = usePages();
  return useMemo(() => {
    if (!isReady) {
      return null;
    }
    const mapped: Record<Id, Annotation> = {};
    for (const page of pages) {
      for (const item of page.items) {
        mapped[item.id] = item;
      }
    }
    return mapped;
  }, [pages, isReady]);
}

export function usePartOf(): PartOf | null {
  const {pages, isReady} = usePages();
  return useMemo(() => {
    if (!isReady) {
      return null;
    }
    return pages[0]?.partOf ?? null;
  }, [pages, isReady]);
}