import {mapAnnotationsById} from '../../diplomatic/example/mapAnnotationsById';
import {Benchmark} from '../../util/Benchmark';
import {renderLineByLineView} from '../renderLineByLineView';
import {AnnotationPage} from "@globalise/annotation";

export async function renderLineWrappingExample($parent: HTMLElement) {
  const pagePath =
    '../iiif/annotations/transcriptions/NL-HaNA_1.04.02_3598_0797.json';
  const pageResponse = await fetch(pagePath);
  const page: AnnotationPage = await pageResponse.json();
  const entityPath =
    '../iiif/annotations/entities/NL-HaNA_1.04.02_3598_0797.json';
  const entityResponse = await fetch(entityPath);
  const entities: AnnotationPage = await entityResponse.json();
  const narrowContainer = document.createElement('div');
  $parent.append(narrowContainer);
  narrowContainer.classList.add('narrow-container');
  const annotations = mapAnnotationsById([...page.items, ...entities.items]);
  new Benchmark(renderLineByLineView.name).run(() => {
    renderLineByLineView({ $view: narrowContainer, annotations });
  });
}
