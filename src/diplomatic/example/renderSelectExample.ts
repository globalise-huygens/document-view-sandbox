import {AnnotationPage} from '../AnnoModel';
import {px} from '../px';
import {
  DiplomaticViewConfig,
  renderDiplomaticView,
} from '../renderDiplomaticView';
import {$} from './$';
import {mapAnnotationsById} from './mapAnnotationsById';
import {Id} from "../Id";
import {findTextualBodyValue} from "../anno/findTextualBodyValue";
import {findSourceLabel} from "../anno/findSourceLabel";
import {renderAnnotationDropdown} from "./renderAnnotationDropdown";

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
    showRegions: true,
    fit: "height"
  };

  $view.style.height = px(window.innerHeight);
  const view = renderDiplomaticView($view, annotations, config);
  const {selectAnnotation, deselectAnnotation} = view

  const $dropdowns = document.createElement('span')
  $menu.append($dropdowns)
  $dropdowns.classList.add('select')

  const selected: Set<Id> = new Set()
  function toggleAnnotation(id: Id) {
    if (selected.has(id)) {
      deselectAnnotation(id)
      selected.delete(id)
    } else {
      selectAnnotation(id);
      selected.add(id)
    }
  }

  const words = page.items.filter(a => a.textGranularity === 'word')
  renderAnnotationDropdown(
    $dropdowns,
    'Toggle words',
    words,
    findTextualBodyValue,
    toggleAnnotation
  );

  const regions = page.items.filter(a => a.textGranularity === 'block')
  renderAnnotationDropdown(
    $dropdowns,
    'Toggle regions',
    regions,
    findSourceLabel,
    toggleAnnotation
  );

}
