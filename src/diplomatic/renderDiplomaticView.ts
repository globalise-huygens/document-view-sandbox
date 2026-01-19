import {Annotation} from './AnnoModel';
import {Id} from './Id';
import {findResourceTarget} from './findResourceTarget';
import {renderLineNumbers} from './renderLineNumbers';
import {renderBlocks} from './renderBlocks';
import {
  defaultConfig as defaultOriginalLayoutConfig,
  FullOriginalLayoutConfig,
  OriginalLayoutConfig,
  renderOriginalLayout,
} from './renderOriginalLayout';

export type FullDiplomaticViewConfig = FullOriginalLayoutConfig & {
  showLines: boolean;
  showRegions: boolean;
  showEntities: boolean
}

export const defaultConfig: FullDiplomaticViewConfig = {
  ...defaultOriginalLayoutConfig,
  showLines: false,
  showRegions: false,
  showEntities: false
}

export type DiplomaticViewConfig =
  & OriginalLayoutConfig
  & Partial<FullDiplomaticViewConfig>;

export function renderDiplomaticView(
  $view: HTMLDivElement,
  annotations: Record<Id, Annotation>,
  config: DiplomaticViewConfig,
) {
  const {showLines, showRegions} = {...defaultConfig, ...config}
  $view.innerHTML = '';
  const layout = renderOriginalLayout($view, annotations, config);
  const {layout: $text, overlay: $svg, scale} = layout;

  const wordsToLine: Record<Id, Id> = {};
  const linesToBlock: Record<Id, Id> = {};
  Object.values(annotations).forEach((anno) => {
    if (anno.textGranularity === 'word') {
      wordsToLine[anno.id] = findResourceTarget(anno).id;
    }
    if (anno.textGranularity === 'line') {
      linesToBlock[anno.id] = findResourceTarget(anno).id;
    }
  });

  if (showRegions) {
    const {showBlock, hideBlock} = renderBlocks(annotations, $svg, {scale});
    layout.onMouseEnter((id) => showBlock(linesToBlock[wordsToLine[id]]))
    layout.onMouseLeave((id) => hideBlock(linesToBlock[wordsToLine[id]]))
  }

  if (showLines) {
    const {showLine, hideLine} = renderLineNumbers(annotations, $text, {scale});
    layout.onMouseEnter((id) => showLine(wordsToLine[id]))
    layout.onMouseLeave((id) => hideLine(wordsToLine[id]))
  }
}
