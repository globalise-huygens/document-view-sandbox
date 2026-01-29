import { Annotation } from '../diplomatic/AnnoModel';
import { renderNormalizedLayout } from './renderNormalizedLayout';
import { isAnnotationResourceTarget } from '../diplomatic/anno/isAnnotationResourceTarget';
import { getEntityType } from '../diplomatic/getEntityType';
import { orThrow } from '../util/orThrow';
import { toClassName } from '../diplomatic/toClassName';
import {renderBlocks} from "./renderBlocks";
import {Id} from "../diplomatic/Id";
import {SelectableView} from "../diplomatic/SelectableView";
import {line} from "d3-shape";
import {findResourceTarget} from "../diplomatic/findResourceTarget";

export function renderLineByLineView({
  $parent,
  annotations,
}: {
  $parent: HTMLElement;
  annotations: Record<Id, Annotation>;
}): SelectableView {

  const { $words, $lines, $overlay } = renderNormalizedLayout($parent, annotations);
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

  const selectedRegions = new Set<Id>()

  const blockConfig = {stroke: 'rgba(220,220,220,1)'};
  const {$blocks} = renderBlocks($lines, $overlay, annotations, blockConfig)

  for (const [lineId, $line] of Object.entries($lines)) {
    const line = annotations[lineId]
    const blockId = findResourceTarget(line).id
    const $block = $blocks[blockId]
    $line.addEventListener("mouseenter", () => {
      if(selectedRegions.has(blockId)){
        return;
      }
      $block.attr("opacity", 1);
    });
    $line.addEventListener("mouseleave", () => {
      if(selectedRegions.has(blockId)){
        return;
      }
      $block.attr("opacity", 0);
    });
  }

  function selectRegion(id: Id) {
    const $block = $blocks[id];
    if(!$block) {
      return;
    }
    if(selectedRegions.has(id)) {
      return;
    }
    selectedRegions.add(id)
    $block.attr('opacity', 1)
  }

  function deselectRegion(id: Id) {
    const $block = $blocks[id];
    if(!$block) {
      return;
    }
    if(!selectedRegions.has(id)) {
      return;
    }
    selectedRegions.delete(id)
    $block.attr('opacity', 0)
  }

  function selectAnnotation(id: Id) {
    const annotation = annotations[id] ?? orThrow('Not found')
    if(annotation.textGranularity === "word") {
      const $word = $words[id]
      $word.classList.add('selected')
    } else if(annotation.textGranularity === "block") {
      selectRegion(id)
    } else {
      console.warn(`Select not implemented: ${annotation.textGranularity}`)
    }
  }

  function deselectAnnotation(id: Id) {
    const annotation = annotations[id] ?? orThrow('Not found')
    if(annotation.textGranularity === "word") {
      const $word = $words[id]
      $word.classList.remove('selected')
    } else if(annotation.textGranularity === "block") {
      deselectRegion(id)
    } else {
      console.warn(`Deselect not implemented: ${annotation.textGranularity}`)
    }
  }

  return {selectAnnotation, deselectAnnotation}
}
