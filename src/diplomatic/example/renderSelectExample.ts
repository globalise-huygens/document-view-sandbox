import {AnnotationPage} from '../AnnoModel';
import {px} from '../px';
import {
  DiplomaticViewConfig,
  renderDiplomaticView,
} from '../renderDiplomaticView';
import {$} from './$';
import {Benchmark} from '../Benchmark';
import {mapAnnotationsById} from './mapAnnotationsById';

export async function renderSelectExample($parent: HTMLElement) {
  const pagePath =
    '../iiif/annotations/transcriptions/NL-HaNA_1.04.02_3598_0797.json';
  const entityPath =
    '../iiif/annotations/entities/NL-HaNA_1.04.02_3598_0797.json';

  $parent.classList.add('select');
  const $view = document.createElement('div');
  $parent.append($view)
  $view.classList.add('diplomatic-view')

  const $menu = $('#menu');

  const $dropdown = document.createElement('span');
  $menu.appendChild($dropdown);
  $dropdown.classList.add('slider');
  $dropdown.innerHTML = `//TODO: select annotation`;

  const pageResponse = await fetch(pagePath);
  const page: AnnotationPage = await pageResponse.json();
  const pageAnnotations = mapAnnotationsById(page.items);
  const entityResponse = await fetch(entityPath);
  const entityPage: AnnotationPage = await entityResponse.json();
  const entityAnnotations = mapAnnotationsById(entityPage.items);
  const annotations = Object.assign({}, pageAnnotations, entityAnnotations);

  const config: DiplomaticViewConfig = {
    page: page.partOf,
    showEntities: true,
    fit: "height"
  };

  $view.style.height = px(window.innerHeight);
  new Benchmark(renderDiplomaticView.name).run(() =>
    renderDiplomaticView($view, annotations, config),
  );

}
