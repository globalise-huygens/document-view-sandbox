import {AnnotationPage} from "../../diplomatic/AnnoModel";
import {mapAnnotationsById} from "../../diplomatic/example/mapAnnotationsById";
import {Benchmark} from "../../diplomatic/Benchmark";
import {renderLineByLineView} from "../renderLineByLineView";
import {$} from "../../diplomatic/example/$";
import {Id} from "../../diplomatic/Id";
import {
  renderAnnotationDropdown
} from "../../diplomatic/example/renderAnnotationDropdown";
import {findTextualBodyValue} from "../../diplomatic/anno/findTextualBodyValue";
import {findSourceLabel} from "../../diplomatic/anno/findSourceLabel";

export async function renderSelectExample($parent: HTMLElement) {
  const pagePath =
    '../iiif/annotations/transcriptions/NL-HaNA_1.04.02_3598_0797.json';
  const pageResponse = await fetch(pagePath);
  const page: AnnotationPage = await pageResponse.json();
  const entityPath =
    '../iiif/annotations/entities/NL-HaNA_1.04.02_3598_0797.json';
  const entityResponse = await fetch(entityPath);
  const entities: AnnotationPage = await entityResponse.json();
  const narrowContainer = document.createElement('div')
  $parent.append(narrowContainer)
  narrowContainer.classList.add('narrow-container')
  const annotations = mapAnnotationsById([...page.items, ...entities.items]);
  const view = renderLineByLineView({$parent: narrowContainer, annotations});

  const {selectAnnotation, deselectAnnotation} = view;
  const $dropdowns = document.createElement('span')

  $('#menu').append($dropdowns)
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