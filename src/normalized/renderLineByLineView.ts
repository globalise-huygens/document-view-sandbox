import { Annotation } from '../diplomatic/AnnoModel';
import { renderNormalizedLayout } from './renderNormalizedLayout';
import { isAnnotationResourceTarget } from '../diplomatic/anno/isAnnotationResourceTarget';
import { getEntityType } from '../diplomatic/getEntityType';
import { orThrow } from '../util/orThrow';
import { toClassName } from '../diplomatic/toClassName';

export function renderLineByLineView({
  $view,
  annotations,
}: {
  $view: HTMLElement;
  annotations: Annotation[];
}) {
  const { $words } = renderNormalizedLayout($view, annotations);
  console.log('renderNormalizedView', { $words });
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
