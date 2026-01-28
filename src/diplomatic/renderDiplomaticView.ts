import { Annotation } from './AnnoModel';
import { Id } from './Id';
import { findResourceTarget } from './findResourceTarget';
import { renderLineNumbers } from './renderLineNumbers';
import { renderBlocks } from './renderBlocks';
import {
  defaultConfig as defaultOriginalLayoutConfig,
  FullOriginalLayoutConfig,
  OriginalLayoutConfig,
  renderOriginalLayout,
} from './renderOriginalLayout';
import { isAnnotationResourceTarget } from './anno/isAnnotationResourceTarget';
import { orThrow } from '../util/orThrow';
import { getEntityType } from './getEntityType';
import { toClassName } from './toClassName';
import { D3El } from './D3El';

export type FullDiplomaticViewConfig = FullOriginalLayoutConfig & {
  showRegions: boolean;
  showEntities: boolean;
};

export const defaultConfig: FullDiplomaticViewConfig = {
  ...defaultOriginalLayoutConfig,
  showRegions: false,
  showEntities: false,
};

export type DiplomaticViewConfig = OriginalLayoutConfig &
  Partial<FullDiplomaticViewConfig>;

export function renderDiplomaticView(
  $view: HTMLDivElement,
  annotations: Record<Id, Annotation>,
  config: DiplomaticViewConfig,
) {
  const { showRegions, showEntities } = { ...defaultConfig, ...config };
  $view.innerHTML = '';
  const originalLayout = renderOriginalLayout($view, annotations, config);
  const { $layout, $overlay, $words, scale } = originalLayout;

  const wordsToLine: Record<Id, Id> = {};
  const linesToBlock: Record<Id, Id> = {};
  const blockToLines: Record<Id, Id[]> = {};
  Object.values(annotations).forEach((anno) => {
    if (anno.textGranularity === 'word') {
      wordsToLine[anno.id] = findResourceTarget(anno).id;
    }
    if (anno.textGranularity === 'line') {
      linesToBlock[anno.id] = findResourceTarget(anno).id;
    }
    if (anno.textGranularity === 'line') {
      const blockId = findResourceTarget(anno).id;
      if (!blockToLines[blockId]) {
        blockToLines[blockId] = [];
      }
      blockToLines[blockId].push(anno.id);
    }
  });

  if (showRegions) {
    const { $blocks } = renderBlocks(annotations, $overlay, { scale });
    const lineNumbers = renderLineNumbers(annotations, $layout, { scale });
    const { showLine, hideLine } = lineNumbers;

    function showRegion($block: D3El<SVGGElement>, lines: Id[]) {
      $block.attr('opacity', 1);
      lines.forEach((l) => showLine(l));
    }

    function hideRegion($block: D3El<SVGGElement>, lines: Id[]) {
      $block.attr('opacity', 0);
      lines.forEach((l) => hideLine(l));
    }

    for (const [wordId, $word] of Object.entries($words)) {
      const blockId = linesToBlock[wordsToLine[wordId]];
      const lineIds = blockToLines[blockId];
      const $block = $blocks[blockId];
      $word.addEventListener('mouseenter', () => showRegion($block, lineIds));
      $word.addEventListener('mouseleave', () => hideRegion($block, lineIds));
    }

    for (const [blockId, $block] of Object.entries($blocks)) {
      const lines = blockToLines[blockId];
      $block.on('mouseenter', () => showRegion($block, lines));
      $block.on('mouseleave', () => hideRegion($block, lines));
    }
  }

  if (showEntities) {
    const entities = Object.values(annotations).filter(
      (a) => a.motivation === 'classifying',
    );
    for (const entity of entities) {
      const resourceTargets = entity.target.filter(isAnnotationResourceTarget);
      const entityType = getEntityType(entity);
      for (const resource of resourceTargets) {
        const $word = $words[resource.id] ?? orThrow('No $word');
        $word.classList.add('entity');
        $word.classList.add(toClassName(entityType));
        $word.title = `${entityType} | ${entity.id}`;
      }
    }
  }
  function selectAnnotation(id: Id) {
    const annotation = annotations[id] ?? orThrow('Not found')
    if(annotation.textGranularity === "word") {
      const $word = $words[id]
      $word.classList.add('selected')
    } else {
      console.warn(`Select not implemented: ${annotation.textGranularity}`)
    }
  }

  function deselectAnnotation(id: Id) {
    const annotation = annotations[id] ?? orThrow('Not found')
    if(annotation.textGranularity === "word") {
      const $word = $words[id]
      $word.classList.remove('selected')
    } else {
      console.warn(`Deselect not implemented: ${annotation.textGranularity}`)
    }
  }

  return {selectAnnotation, deselectAnnotation}
}
