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
import {isAnnotationResourceTarget} from "./anno/isAnnotationResourceTarget";
import {orThrow} from "../util/orThrow";
import {getEntityType} from "./getEntityType";
import {toClassName} from "./toClassName";

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
  const {showLines, showRegions, showEntities} = {...defaultConfig, ...config}
  $view.innerHTML = '';
  const originalLayout = renderOriginalLayout($view, annotations, config);
  const {$layout, $overlay, $words, scale} = originalLayout;

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
    const {showBlock, hideBlock} = renderBlocks(annotations, $overlay, {scale});
    for (const [id, $word] of Object.entries($words)) {
      const blockId = linesToBlock[wordsToLine[id]];
      $word.addEventListener('mouseenter', () => showBlock(blockId));
      $word.addEventListener('mouseleave', () => hideBlock(blockId));
    }
  }

  if (showLines) {
    const {showLine, hideLine} = renderLineNumbers(annotations, $layout, {scale});
    for (const [id, $word] of Object.entries($words)) {
      const lineId = wordsToLine[id];
      $word.addEventListener('mouseenter', () => showLine(lineId))
      $word.addEventListener('mouseleave', () => hideLine(lineId))
    }
  }
  if (showEntities) {
    const entities = Object.values(annotations)
      .filter(a => a.motivation === 'classifying')
    for (const entity of entities) {
      const resourceTargets = entity.target.filter(isAnnotationResourceTarget)
      const entityType = getEntityType(entity);
      for (const resource of resourceTargets) {
        const $word = $words[resource.id] ?? orThrow('No $word')
        const typeClassname = toClassName(entityType);
        $word.classList.add(typeClassname)
        $word.title = `${entityType} | ${entity.id}`
      }
    }
  }
}
