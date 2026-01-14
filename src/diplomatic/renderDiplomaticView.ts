import { Annotation, AnnotationPage } from './AnnoModel';
import { Id } from './Id';
import { findResourceTarget } from './findResourceTarget';
import { renderLineNumbers } from './renderLineNumbers';
import { renderBlocks } from './renderBlocks';
import {
  OriginalLayoutConfig,
  renderOriginalLayout,
} from './renderOriginalLayout';

type TimedCallback = { timeout: number; callback: () => void };

export function renderDiplomaticView(
  $view: HTMLDivElement,
  page: AnnotationPage,
  config?: Partial<OriginalLayoutConfig>,
) {
  $view.innerHTML = '';
  const originalLayout = renderOriginalLayout($view, page, config);
  const { layout: $text, overlay: $svg, scale } = originalLayout;

  const annotations = page.items.reduce(
    (prev, curr) => {
      prev[curr.id] = curr;
      return prev;
    },
    {} as Record<Id, Annotation>,
  );
  const $blockHighlights = renderBlocks(annotations, $svg, { scale });
  const $lineNumbers = renderLineNumbers(annotations, $text, { scale });

  /**
   * Prevent flickering of blocks and lines when hovering words
   */
  const timedLineHides: Map<Id, TimedCallback> = new Map();
  const timedBlockHides: Map<Id, number> = new Map();

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

    timedLineHides.set(lineId, { timeout, callback });
  }

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

  const wordsToLine: Record<Id, Id> = {};
  const linesToBlock: Record<Id, Id> = {};
  Object.entries(annotations).forEach(([id, anno]) => {
    if (anno.textGranularity === 'word') {
      wordsToLine[id] = findResourceTarget(anno).id;
    }
    if (anno.textGranularity === 'line') {
      linesToBlock[id] = findResourceTarget(anno).id;
    }
  });

  originalLayout.onMouseEnter((id) => {
    const anno = annotations[id];
    if (anno?.textGranularity !== 'word') return;
    const lineId = wordsToLine[id];
    showLine(lineId);
    showBlock(linesToBlock[lineId]);
  });
  originalLayout.onMouseLeave((id) => {
    const anno = annotations[id];
    if (anno?.textGranularity !== 'word') return;
    const lineId = wordsToLine[id];
    hideLine(lineId);
    hideBlock(linesToBlock[lineId]);
  });
}
