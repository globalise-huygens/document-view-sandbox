import { Annotation } from '../diplomatic/AnnoModel';
import { renderNormalizedLayout } from './renderNormalizedLayout';
import { isAnnotationResourceTarget } from '../diplomatic/anno/isAnnotationResourceTarget';
import { getEntityType } from '../diplomatic/getEntityType';
import { orThrow } from '../util/orThrow';
import { toClassName } from '../diplomatic/toClassName';
import {renderBlocks} from "./renderBlocks";
import {Id} from "../diplomatic/Id";

export function renderLineByLineView({
  $parent,
  annotations,
}: {
  $parent: HTMLElement;
  annotations: Record<Id, Annotation>;
}) {

  const { $words, $lines, $overlay } = renderNormalizedLayout($parent, annotations);
  const entities = Object.values(annotations).filter(
    (a) => a.motivation === 'classifying',
  );

  renderBlocks($lines, $overlay, annotations, {stroke: 'rgba(220,220,220,1)'})

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
