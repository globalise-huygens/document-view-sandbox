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
    const {showBlock, hideBlock} = renderBlocks(annotations, $svg, {scale});
    wordEnterCallbacks.push((wordId) => {
      showBlock(linesToBlock[wordsToLine[wordId]])
    })
    wordLeaveCallbacks.push((wordId) => {
      hideBlock(linesToBlock[wordsToLine[wordId]])
    })
  }

  if (showLines) {
    const {showLine, hideLine} = renderLineNumbers(annotations, $text, {scale});
    wordEnterCallbacks.push((wordId) => showLine(wordsToLine[wordId]))
    wordLeaveCallbacks.push((wordId) => hideLine(wordsToLine[wordId]))
  }
}
