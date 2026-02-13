import { Annotation, AnnotationPage } from '../../diplomatic/AnnoModel';
import { mapAnnotationsById } from '../../diplomatic/example/mapAnnotationsById';
import { assertTextualBody } from '../../diplomatic/anno/assertTextualBody';
import { findTextPositionSelector } from '../../diplomatic/findTextPositionSelector';
import { AnnotationId, TextRange } from '../Model';
import { createRanges } from '../createRanges';
import { getEntityType } from '../../diplomatic/getEntityType';
import { isEntityBody } from '../../diplomatic/EntityModel';
import { toClassName } from '../../diplomatic/toClassName';

export async function renderPageEntitiesExample($view: HTMLElement) {
  const pagePath =
    '../iiif/annotations/transcriptions/NL-HaNA_1.04.02_3598_0797.json';
  const entityPath =
    '../iiif/annotations/entities/NL-HaNA_1.04.02_3598_0797.json';

  const pageResponse = await fetch(pagePath);
  const page: AnnotationPage = await pageResponse.json();
  const entityResponse = await fetch(entityPath);
  const entityPage: AnnotationPage = await entityResponse.json();
  const entities = mapAnnotationsById(entityPage.items);
  const annotations = Object.assign(
    {},
    mapAnnotationsById(page.items),
    entities,
  );

  const pageAnnotations = page.items.filter(
    (a) => a.textGranularity === 'page',
  );
  const pageAnnotation = pageAnnotations[0];
  const { body: bodies } = pageAnnotation;
  const body = Array.isArray(bodies) ? bodies[0] : bodies;
  assertTextualBody(body);

  const entityRanges = Object.values(entities).map((annotation) => {
    const selector = findTextPositionSelector(annotation);
    return {
      begin: selector.start,
      end: selector.end,
      body: annotation,
    };
  });
  const pageText = body.value;
  const textRanges = createRanges(pageText, entityRanges);
  console.log('page entities', {
    page,
    pageAnnotations,
    texts: pageAnnotations.map((a: any) => ({ t: a.body[0].value, id: a.id })),
    pageAnnotation,
    body,
    entities,
    entityRanges,
    textRanges,
  });
  renderText($view, pageText, [...textRanges.values()], annotations);
}

function renderText(
  $container: HTMLElement,
  text: string,
  ranges: TextRange[],
  annotations: Record<AnnotationId, Annotation>,
) {
  for (const range of ranges) {
    const $span = document.createElement('span');
    $span.classList.add('entity');
    $span.textContent = text.substring(range.begin, range.end);
    if (range.annotations.length) {
      const types: string[] = range.annotations.map((id) => {
        const a = annotations[id];
        return isEntityBody(a.body) ? 'no-entity' : getEntityType(a);
      });
      $span.title = types.join(', ');
      $span.classList.add(...types.map(toClassName));
    }
    $container.appendChild($span);
  }
}
