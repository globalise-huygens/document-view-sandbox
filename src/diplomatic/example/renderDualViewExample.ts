import {AnnotationPage} from '../AnnoModel';
import {px} from '../px';
import {renderDiplomaticView,} from '../renderDiplomaticView';
import {$} from './$';
import {mapAnnotationsById} from './mapAnnotationsById';
import {renderLineByLineView} from "../../normalized/renderLineByLineView";
import {renderAnnotationDropdown} from "./renderAnnotationDropdown";
import {findTextualBodyValue} from "../anno/findTextualBodyValue";
import {findSourceLabel} from "../anno/findSourceLabel";
import {combineViews} from "./combineViews";

export async function renderDualViewExample($parent: HTMLElement) {
  console.log('dual-view')
  const pagePath =
    '../iiif/annotations/transcriptions/NL-HaNA_1.04.02_3598_0797.json';
  const entityPath =
    '../iiif/annotations/entities/NL-HaNA_1.04.02_3598_0797.json';
  // const pagePath = "../data/3965_selection/NL-HaNA_1.04.02_3965_0177.json";
  // const pagePath = '../iiif/annotations/transcriptions/NL-HaNA_1.04.02_3598_0799.json';
  // const pagePath = '../iiif/annotations/transcriptions/NL-HaNA_1.04.02_3598_1007.json';
  // const pagePath = '../iiif/annotations/transcriptions/NL-HaNA_1.04.02_3598_1012.json';

  $parent.classList.add('dual-view');
  const $menu = $('#menu');
  const $controls = document.createElement('span')
  $menu.append($controls)
  $controls.classList.add('controls')

  const pageResponse = await fetch(pagePath);
  const page: AnnotationPage = await pageResponse.json();
  const pageAnnotations = mapAnnotationsById(page.items);
  const entityResponse = await fetch(entityPath);
  const entityPage: AnnotationPage = await entityResponse.json();
  const entityAnnotations = mapAnnotationsById(entityPage.items);
  const annotations = Object.assign({}, pageAnnotations, entityAnnotations);

  const windowHeight = window.innerHeight;

  const $diplomaticView = document.createElement('div');
  $parent.append($diplomaticView)
  $diplomaticView.style.height = px(windowHeight);

  const $lineByLineView = document.createElement('div');
  $parent.append($lineByLineView)

  const diplomaticView = renderDiplomaticView($diplomaticView, annotations, {
    page: page.partOf,
    showEntities: true,
    fit: 'height',
    showRegions: true
  });
  diplomaticView.hide()

  const lineByLineView = renderLineByLineView({
    $view: $lineByLineView,
    annotations
  });
  diplomaticView.hide()

  const dualView = combineViews({
    diplomaticView,
    lineByLineView
  })

  const $toggle = document.createElement('button');
  $controls.appendChild($toggle);
  $toggle.textContent = 'Toggle view'
  $toggle.addEventListener('click', () => dualView.toggle())
  dualView.toggle()

  const words = page.items.filter(a => a.textGranularity === 'word')
  renderAnnotationDropdown(
    $controls,
    'Toggle words',
    words,
    findTextualBodyValue,
    dualView.toggleAnnotation
  );

  const regions = page.items.filter(a => a.textGranularity === 'block')
  renderAnnotationDropdown(
    $controls,
    'Toggle regions',
    regions,
    findSourceLabel,
    dualView.toggleAnnotation
  );
}

