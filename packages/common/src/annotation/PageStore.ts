import {useMemo} from 'react';
import {create} from 'zustand';
import {Id} from './Id.ts';
import {Annotation, AnnotationPage, PartOf} from './AnnoModel.ts';
import {
  indexTextGranularity,
  TextGranularityIndex
} from './indexTextGranularity.ts';

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

export const usePageStore = create<
  PageState & { load: (canvasId: Id, urls: string[]) => Promise<void> }
>((set) => {
  let abortController: AbortController;

  return ({
    ...defaultState,

    load: async (canvasId, urls) => {
      abortController?.abort();
      abortController = new AbortController();

      set({...defaultState, canvasId, isLoading: true});

      if (!urls.length) {
        set({canvasId, pages: [], isLoading: false});
        return;
      }

      const {signal} = abortController;
      try {
        const pages = await Promise.all(
          urls.map(url => fetch(url, {signal}).then(r => r.json()))
        ) as AnnotationPage[];

        set({pages, isLoading: false});
      } catch (e) {
        if (signal.aborted) {
          return;
        }
        const error = e instanceof Error ? e.message : 'Unknown error';
        set({isLoading: false, error});
      }
    },
  });
});

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

export function useTextGranularity(): TextGranularityIndex | null {
  const annotations = useAnnotations();
  return useMemo(() => {
    if (!annotations) {
      return null;
    }
    return indexTextGranularity(annotations);
  }, [annotations]);
}