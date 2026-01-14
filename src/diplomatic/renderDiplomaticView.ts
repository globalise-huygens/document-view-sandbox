import {Annotation, AnnotationPage} from './AnnoModel';
import {Id} from './Id';
import {findResourceTarget} from './findResourceTarget';
import {renderLineNumbers} from "./renderLineNumbers";
import {renderBlocks} from "./renderBlocks";
import {
  OriginalLayoutConfig,
  renderOriginalLayout
} from "./renderOriginalLayout";

export function renderDiplomaticView(
  $view: HTMLDivElement,
  page: AnnotationPage,
  config?: Partial<OriginalLayoutConfig>,
) {
  $view.innerHTML = '';
  const originalLayout = renderOriginalLayout($view, page, config);
  const {$svg, $text, $words, scale} = originalLayout;

  const annotations = page.items.reduce((prev, curr) => {
    prev[curr.id] = curr
    return prev
  }, {} as Record<Id, Annotation>)
  const $blockHighlights = renderBlocks(annotations, $svg, {scale});
  const $lineNumbers = renderLineNumbers(annotations, $text, {scale});

  /**
   * Prevent flickering of blocks and lines when hovering words
   */
  const hideLineTimeouts: Map<Id, number> = new Map();
  const hideBlockTimeouts: Map<Id, number> = new Map();

  function showLine(lineId: Id) {
    const existingTimeout = hideLineTimeouts.get(lineId);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
      hideLineTimeouts.delete(lineId);
    }
    $lineNumbers[lineId].style.display = 'block';
  }

  function hideLine(lineId: Id) {
    const timeoutId = window.setTimeout(() => {
      $lineNumbers[lineId].style.display = 'none';
      hideLineTimeouts.delete(lineId);
    }, 50);
    hideLineTimeouts.set(lineId, timeoutId);
  }

  function showBlock(blockId: Id) {
    const existingTimeout = hideBlockTimeouts.get(blockId);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
      hideBlockTimeouts.delete(blockId);
    }
    $blockHighlights[blockId].attr('visibility', 'visible');
  }

  function hideBlock(blockId: Id) {
    const timeoutId = window.setTimeout(() => {
      $blockHighlights[blockId].attr('visibility', 'hidden');
      hideBlockTimeouts.delete(blockId);
    }, 150);
    hideBlockTimeouts.set(blockId, timeoutId);
  }

  const wordAnnos = page.items.filter((a) => a.textGranularity === 'word');
  wordAnnos.forEach((word) => {
    const id = word.id;
    const $word = $words[id];
    const line = annotations[findResourceTarget(word).id];
    const block = annotations[findResourceTarget(line).id];
    $word.addEventListener('mouseenter', () => {
      showLine(line.id);
      showBlock(block.id);
    });
    $word.addEventListener('mouseleave', () => {
      hideLine(line.id);
      hideBlock(block.id);
    });
  });
}
