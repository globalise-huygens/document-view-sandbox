import {useEffect, useMemo} from 'react';
import {create} from 'zustand';
import {Id} from './Id.ts';
import {Annotation, AnnotationPage, PartOf} from './AnnoModel.ts';
import {
  indexTextGranularity,
  TextGranularityIndex
} from './indexTextGranularity.ts';

import {indexEntityOverlap, EntityOverlapIndex} from './indexEntityOverlap';
import {getPageText} from './getPageText';
import {findTextPositionSelector} from './findTextPositionSelector';
import {isEntity} from './EntityModel.ts';
import {fetchJson} from '../util/fetchJson.ts';

export type PageState = {
  canvasId: Id | null;
  urls: string[];
  pages: AnnotationPage[];
  isLoading: boolean;
  error: string | null;
};

const defaultState: PageState = {
  canvasId: null,
  urls: [],
  pages: [],
  isLoading: false,
  error: null,
};

export const usePageStore = create<
  PageState & {
  load: (canvasId: Id, urls: string[]) => Promise<void>;
  setError: (error: string) => void;
}
>((set) => {
  let abortController: AbortController;

  return ({
    ...defaultState,

    setError: (error: string) => set({error}),

    load: async (canvasId, urls) => {
      abortController?.abort();
      abortController = new AbortController();

      set({...defaultState, canvasId, urls, isLoading: true});

      if (!urls.length) {
        set({canvasId, urls, pages: [], isLoading: false});
        return;
      }

      const {signal} = abortController;
      try {
        const pages = await Promise.all(
          urls.map(url => fetchJson<AnnotationPage>(url, {signal}))
        );

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
  const setError = usePageStore((s) => s.setError);

  const {annotations, error} = useMemo(() => {
    if (!isReady) {
      return {annotations: null, error: null};
    }

    const mapped: Record<Id, Annotation> = {};
    for (const page of pages) {
      for (const item of page.items) {
        mapped[item.id] = item;
      }
    }

    try {
      const {id: pageId} = getPageText(mapped);
      for (const id in mapped) {
        const item = mapped[id];
        if (!isEntity(item)) {
          continue;
        }
        try {
          findTextPositionSelector(item, pageId);
        } catch {
          console.debug(`Skip entity without htr selector: ${item.id}`);
          delete mapped[item.id];
        }
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Processing error';
      return {annotations: null, error: msg};
    }

    return {annotations: mapped, error: null};
  }, [pages, isReady]);

  useEffect(() => {
    if (error) {
      setError(error);
    }
  }, [error, setError]);

  return annotations;
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

export type FullTextIndex = TextGranularityIndex & EntityOverlapIndex;

const emptyEntityIndex: EntityOverlapIndex = {
  entityToWords: {},
  entityToBlock: {},
};

const emptyIndex: FullTextIndex = {
  wordsToLine: {},
  linesToBlock: {},
  blockToLines: {},
  wordToBlock: {},
  ...emptyEntityIndex,
};

export function useTextGranularity(): TextGranularityIndex {
  const annotations = useAnnotations();
  return useMemo(() => {
    if (!annotations) {
      return emptyIndex;
    }
    return indexTextGranularity(annotations);
  }, [annotations]);
}

export function useEntityOverlap(): EntityOverlapIndex {
  const annotations = useAnnotations();
  const {wordToBlock} = useTextGranularity();
  return useMemo(() => {
    if (!annotations) {
      return emptyEntityIndex;
    }
    const {id: pageAnnoId} = getPageText(annotations);
    return indexEntityOverlap(annotations, pageAnnoId, wordToBlock);
  }, [annotations, wordToBlock]);
}