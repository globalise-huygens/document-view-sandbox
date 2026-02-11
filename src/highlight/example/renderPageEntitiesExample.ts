import {Annotation, AnnotationPage} from '../../diplomatic/anno/AnnoModel';
import {mapAnnotationsById} from '../../diplomatic/example/mapAnnotationsById';
import {
  findTextPositionSelector
} from '../../diplomatic/anno/findTextPositionSelector';
import {AnnotationId, TextRange} from '../Model';
import {createRanges} from '../createRanges';
import {getEntityType} from '../../diplomatic/getEntityType';
import {isEntity} from '../../diplomatic/EntityModel';
import {toClassName} from '../../diplomatic/toClassName';
import {getPageText} from "../../diplomatic/getPageText";

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
  // transcription-normalized vs. transcription-diplomatic (htr):
  console.log('pageAnnotations', pageAnnotations)
  const {id: pageAnnoId, text: pageText} = getPageText(annotations);

  const entityRanges = Object.values(entities).map((annotation) => {
    const selector = findTextPositionSelector(annotation, pageAnnoId);
    return {
      begin: selector.start,
      end: selector.end,
      body: annotation,
    };
  });
  const textRanges = createRanges(pageText, entityRanges);
  console.log('page entities', {
    page,
    pageAnnotations,
    entities,
    entityRanges,
    textRanges,
  });
  renderText($view, pageText, [...Object.values(textRanges)], annotations);
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
        const annotation = annotations[id];
        return isEntity(annotation) ? getEntityType(annotation) : 'no-entity';
      });
      $span.title = types.join(', ');
      $span.classList.add(...types.map(toClassName));
    }
    $container.appendChild($span);
  }
}
