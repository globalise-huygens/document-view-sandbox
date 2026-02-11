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
import {orThrow} from '../util/orThrow';
import {D3El} from './D3El';
import {View} from './View';
import {createFragment} from "./createFragment";
import {isAnnotationResourceTarget} from "./anno/isAnnotationResourceTarget";
import {getEntityType} from "./getEntityType";
import {toClassName} from "./toClassName";

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
): View {
  $view.classList.add('original-layout');

  function show() {
    $view.style.visibility = 'visible';
  }

  function hide() {
    $view.style.visibility = 'hidden';
  }

  const { showRegions, showEntities } = { ...defaultConfig, ...config };
  $view.innerHTML = '';
  const wordAnnos = Object.values(annotations)
    .filter((a) => a.textGranularity === 'word');
  const fragments = wordAnnos.map(createFragment)
  const originalLayout = renderOriginalLayout($view, fragments, config);
  const { $layout, $overlay, $fragments, scale } = originalLayout;

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

  const selectedRegions = new Set<Id>();
  let selectRegion: (id: Id) => void = () => console.warn('Not implemented');
  let deselectRegion: (id: Id) => void = () => console.warn('Not implemented');

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

    function enterRegion($block: D3El<SVGGElement>, lines: Id[], id: Id) {
      if (selectedRegions.has(id)) {
        return;
      }
      showRegion($block, lines);
    }
    function leaveRegion($block: D3El<SVGGElement>, lines: Id[], id: Id) {
      if (selectedRegions.has(id)) {
        return;
      }
      hideRegion($block, lines);
    }

    for (const [wordId, $word] of Object.entries($fragments)) {
      const blockId = linesToBlock[wordsToLine[wordId]];
      const lineIds = blockToLines[blockId];
      const $block = $blocks[blockId];
      $word.addEventListener('mouseenter', () =>
        enterRegion($block, lineIds, blockId),
      );
      $word.addEventListener('mouseleave', () =>
        leaveRegion($block, lineIds, blockId),
      );
    }

    for (const [blockId, $block] of Object.entries($blocks)) {
      const lineIds = blockToLines[blockId];
      $block.on('mouseenter', () => enterRegion($block, lineIds, blockId));
      $block.on('mouseleave', () => leaveRegion($block, lineIds, blockId));
    }
    selectRegion = (id: Id) => {
      const $block = $blocks[id];
      if (!$block) {
        return;
      }
      if (selectedRegions.has(id)) {
        return;
      }
      selectedRegions.add(id);
      const lines = blockToLines[id];
      showRegion($block, lines);
    };
    deselectRegion = (id: Id) => {
      const $block = $blocks[id];
      if (!$block) {
        return;
      }
      if (!selectedRegions.has(id)) {
        return;
      }
      selectedRegions.delete(id);
      const lines = blockToLines[id];
      hideRegion($block, lines);
    };
  }

  if (showEntities) {
    const entities = Object.values(annotations).filter(
      (a) => a.motivation === 'classifying',
    );
    for (const entity of entities) {
      const resourceTargets = entity.target.filter(isAnnotationResourceTarget);
      const entityType = getEntityType(entity);
      for (const resource of resourceTargets) {
        const $word = $fragments[resource.id] ?? orThrow('No $word');
        $word.classList.add('entity');
        $word.classList.add(toClassName(entityType));
        $word.title = `${entityType} | ${entity.id}`;
      }
    }
  }
  function selectAnnotation(id: Id) {
    const annotation = annotations[id] ?? orThrow('Not found');
    if (annotation.textGranularity === 'word') {
      const $word = $fragments[id];
      $word.classList.add('selected');
    } else if (annotation.textGranularity === 'block') {
      selectRegion(id);
    } else {
      console.warn(`Select not implemented: ${annotation.textGranularity}`);
    }
  }

  function deselectAnnotation(id: Id) {
    const annotation = annotations[id] ?? orThrow('Not found');
    if (annotation.textGranularity === 'word') {
      const $word = $fragments[id];
      $word.classList.remove('selected');
    } else if (annotation.textGranularity === 'block') {
      deselectRegion(id);
    } else {
      console.warn(`Deselect not implemented: ${annotation.textGranularity}`);
    }
  }

  return {
    selectAnnotation,
    deselectAnnotation,
    hide,
    show,
  };
}

