import {useShallow} from 'zustand/react/shallow';
import {Id} from '../annotation';
import {Annotation, AnnotationPage, PartOf} from '../annotation';
import {
  indexTextGranularity,
  TextGranularityIndex,
} from '../annotation/indexTextGranularity';
import {
  indexEntityOverlap,
  EntityOverlapIndex,
} from '../annotation/indexEntityOverlap';
import {getPageText} from '../annotation';
import {findTextPositionSelector} from '../annotation';
import {isEntity} from '../annotation';
import {FetchError, fetchJson} from '../util/fetchJson';
import {useDocumentStore} from './DocumentStore';
import {clearSelection} from './SelectionSlice';

export type PagesSlice = {
  canvasId: Id | null;
  urls: string[];
  pages: AnnotationPage[];
  isLoading: boolean;
  error: string | null;
  annotations: Record<Id, Annotation> | null;
  partOf: PartOf | null;
  textGranularity: TextGranularityIndex;
  entityOverlap: EntityOverlapIndex;
  abortController: AbortController | null;
};

export const emptyTextGranularity: TextGranularityIndex = {
  wordsToLine: {},
  linesToBlock: {},
  blockToLines: {},
  wordToBlock: {},
};

export const emptyEntityOverlap: EntityOverlapIndex = {
  entityToWords: {},
  entityToBlock: {},
};

export const defaultPagesSlice: PagesSlice = {
  canvasId: null,
  urls: [],
  pages: [],
  isLoading: false,
  error: null,
  annotations: null,
  partOf: null,
  textGranularity: emptyTextGranularity,
  entityOverlap: emptyEntityOverlap,
  abortController: null,
};

function processPages(pages: AnnotationPage[]) {
  const mapped: Record<Id, Annotation> = {};
  for (const page of pages) {
    for (const item of page.items) {
      mapped[item.id] = item;
    }
  }

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
      delete mapped[id];
    }
  }

  const textGranularity = indexTextGranularity(mapped);
  const entityOverlap = indexEntityOverlap(
    mapped, pageId, textGranularity.wordToBlock
  );
  const partOf = pages[0]?.partOf ?? null;

  return {annotations: mapped, partOf, textGranularity, entityOverlap};
}

export async function loadPages(canvasId: Id, urls: string[]) {
  const {abortController: prev} = useDocumentStore.getState();
  prev?.abort();

  const abortController = new AbortController();

  clearSelection();
  useDocumentStore.setState({
    ...defaultPagesSlice,
    canvasId,
    urls,
    isLoading: true,
    abortController,
  });

  if (!urls.length) {
    useDocumentStore.setState({canvasId, urls, pages: [], isLoading: false});
    return;
  }

  const {signal} = abortController;
  try {
    const results = await Promise.allSettled(
      urls.map(url => fetchJson<AnnotationPage>(url, {signal}))
    );

    const success: AnnotationPage[] = [];
    const errors: Error[] = [];

    for (let i = 0; i < results.length; i++) {
      const result = results[i];
      if (result.status === 'fulfilled') {
        success.push(result.value);
      } else {
        errors.push(result.reason);
      }
    }

    if (errors.length) {
      /**
       * TODO: remove when empty entity pages do not result in 403:
       */
      const isEntities403 = errors.every(e =>
        e instanceof FetchError
        && e.status === 403
        && e.url.includes('entities')
      );
      if (isEntities403) {
        console.warn('No entities page');
      } else {
        throw errors[0];
      }
    }

    const processed = processPages(success);
    useDocumentStore.setState({
      pages: success,
      isLoading: false,
      ...processed,
    });
  } catch (e) {
    if (signal.aborted) {
      return;
    }
    const error = e instanceof Error ? e.message : 'Unknown error';
    useDocumentStore.setState({isLoading: false, error});
  }
}

export function usePages() {
  return useDocumentStore(useShallow(s => ({
    canvasId: s.canvasId,
    pages: s.pages,
    isLoading: s.isLoading,
    error: s.error,
    isReady: !!(s.canvasId && !s.isLoading && !s.error),
  })));
}

export function useLoadPages() {
  return loadPages;
}

export function useAnnotations(): Record<Id, Annotation> | null {
  return useDocumentStore(s => s.annotations);
}

export function usePartOf(): PartOf | null {
  return useDocumentStore(s => s.partOf);
}

export function useTextGranularity(): TextGranularityIndex {
  return useDocumentStore(s => s.textGranularity);
}
