import {Annotation, AnnotationPage} from './AnnoModel';
import {Id} from './Id';
import {findResourceTarget} from './findResourceTarget';
import {renderLineNumbers} from './renderLineNumbers';
import {renderBlocks} from './renderBlocks';
import {
  defaultConfig as defaultOriginalLayoutConfig,
  OriginalLayoutConfig,
  renderOriginalLayout,
} from './renderOriginalLayout';

type TimedCallback = { timeout: number; callback: () => void };

export type DiplomaticViewConfig = OriginalLayoutConfig & {
  showLines: boolean;
  showRegions: boolean;
}

export const defaultConfig = {
  ...defaultOriginalLayoutConfig,
  showLines: false,
  showRegions: false,
}

export function renderDiplomaticView(
  $view: HTMLDivElement,
  page: AnnotationPage,
  config?: Partial<DiplomaticViewConfig>,
) {
  const {showLines, showRegions} = {...defaultConfig, ...config}
  $view.innerHTML = '';
  const originalLayout = renderOriginalLayout($view, page, config);
  const {layout: $text, overlay: $svg, scale} = originalLayout;

  const annotations = page.items.reduce(
    (prev, curr) => {
      prev[curr.id] = curr;
      return prev;
    },
    {} as Record<Id, Annotation>,
  );

  const wordEnterCallbacks: ((wordId: Id) => void)[] = []
  const wordLeaveCallbacks: ((wordId: Id) => void)[] = []

  originalLayout.onMouseEnter((id) => {
    const anno = annotations[id];
    if (anno?.textGranularity !== 'word') {
      return;
    }
    wordEnterCallbacks.forEach(c => c(id))
  });
  originalLayout.onMouseLeave((id) => {
    const anno = annotations[id];
    if (anno?.textGranularity !== 'word') {
      return;
    }
    wordLeaveCallbacks.forEach(c => c(id))
  });

  const wordsToLine: Record<Id, Id> = {};
  const linesToBlock: Record<Id, Id> = {};
  page.items.forEach((anno) => {
    if (anno.textGranularity === 'word') {
      wordsToLine[anno.id] = findResourceTarget(anno).id;
    }
    if (anno.textGranularity === 'line') {
      linesToBlock[anno.id] = findResourceTarget(anno).id;
    }
  });

  if (showRegions) {
    const $blockHighlights = renderBlocks(annotations, $svg, {scale});

    const timedBlockHides: Map<Id, number> = new Map();
    function showBlock(blockId: Id) {
      const existingTimeout = timedBlockHides.get(blockId);
      if (existingTimeout) {
        clearTimeout(existingTimeout);
        timedBlockHides.delete(blockId);
      }
      $blockHighlights[blockId].attr('visibility', 'visible');
    }

    function hideBlock(blockId: Id) {
      const timeoutId = window.setTimeout(() => {
        $blockHighlights[blockId].attr('visibility', 'hidden');
        timedBlockHides.delete(blockId);
      }, 150);
      timedBlockHides.set(blockId, timeoutId);
    }

    wordEnterCallbacks.push((wordId) => {
      showBlock(linesToBlock[wordsToLine[wordId]])
    })
    wordLeaveCallbacks.push((wordId) => {
      hideBlock(linesToBlock[wordsToLine[wordId]])
    })
  }

  if (showLines) {
    const $lineNumbers = renderLineNumbers(annotations, $text, {scale});

    /**
     * Prevent flickering of blocks and lines when hovering words
     */
    const timedLineHides: Map<Id, TimedCallback> = new Map();

    function showLine(lineId: Id) {
      const existingHide = timedLineHides.get(lineId);
      // Cancel hiding current line:
      if (existingHide) {
        clearTimeout(existingHide.timeout);
        timedLineHides.delete(lineId);
      }
      // Hide all other lines immediately:
      timedLineHides.forEach((t) => {
        clearTimeout(t.timeout);
        t.callback();
      });
      $lineNumbers[lineId].style.display = 'block';
    }

    function hideLine(lineId: Id) {
      const timeout = window.setTimeout(callback, 50);

      function callback() {
        $lineNumbers[lineId].style.display = 'none';
        timedLineHides.delete(lineId);
      }

      timedLineHides.set(lineId, {timeout, callback});
    }

    wordEnterCallbacks.push((wordId) => showLine(wordsToLine[wordId]))
    wordLeaveCallbacks.push((wordId) => hideLine(wordsToLine[wordId]))
  }
}
