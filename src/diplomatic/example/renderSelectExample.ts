import {AnnotationPage} from '../AnnoModel';
import {px} from '../px';
import {
  DiplomaticViewConfig,
  renderDiplomaticView,
} from '../renderDiplomaticView';
import {$} from './$';
import {Benchmark} from '../Benchmark';
import {mapAnnotationsById} from './mapAnnotationsById';
import {words} from "lodash";
import {findTextualBodyValue} from "../../normalized/findTextualBodyValue";
import {orThrow} from "../../util/orThrow";
import {Id} from "../Id";

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
  const view = renderDiplomaticView($view, annotations, config);
  const {selectAnnotation, deselectAnnotation} = view
  const words = page.items.filter(a => a.textGranularity === 'word')

  const $dropdown = document.createElement('select');
  $menu.appendChild($dropdown);
  $dropdown.classList.add('select');

  const $placeholder = document.createElement('option');
  $placeholder.value = '';
  $placeholder.textContent = 'Select / deselect annotations';
  $placeholder.disabled = true;
  $placeholder.selected = true;
  $dropdown.appendChild($placeholder);

  const selected: Set<Id> = new Set()
  Object.values(words).forEach((annotation) => {
    const $option = document.createElement('option');
    $option.value = annotation.id;
    $option.textContent = findTextualBodyValue(annotation);
    $dropdown.appendChild($option);
  });
  $dropdown.addEventListener('change', () => {
    const id = $dropdown.value;
    if (selected.has(id)) {
      deselectAnnotation(id)
      selected.delete(id)
    } else {
      selectAnnotation(id);
      selected.add(id)
    }
    $dropdown.selectedIndex = 0;
  });
}
