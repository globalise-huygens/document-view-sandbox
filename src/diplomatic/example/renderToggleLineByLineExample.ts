import {AnnotationPage} from '../AnnoModel';
import {px} from '../px';
import {renderDiplomaticView,} from '../renderDiplomaticView';
import {$} from './$';
import {Benchmark} from '../Benchmark';
import {mapAnnotationsById} from './mapAnnotationsById';
import {renderLineByLineView} from "../../normalized/renderLineByLineView";

export async function renderToggleLineByLineExample($parent: HTMLElement) {
  console.log('with-line-by-line')
  const pagePath =
    '../iiif/annotations/transcriptions/NL-HaNA_1.04.02_3598_0797.json';
  const entityPath =
    '../iiif/annotations/entities/NL-HaNA_1.04.02_3598_0797.json';
  // const pagePath = "../data/3965_selection/NL-HaNA_1.04.02_3965_0177.json";
  // const pagePath = '../iiif/annotations/transcriptions/NL-HaNA_1.04.02_3598_0799.json';
  // const pagePath = '../iiif/annotations/transcriptions/NL-HaNA_1.04.02_3598_1007.json';
  // const pagePath = '../iiif/annotations/transcriptions/NL-HaNA_1.04.02_3598_1012.json';

  $parent.classList.add('with-line-by-line');
  const $menu = $('#menu');
  const $toggle = document.createElement('button');
  $menu.appendChild($toggle);
  $toggle.classList.add('toggle');

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
  $diplomaticView.classList.add('diplomatic-view')
  $diplomaticView.style.visibility = 'hidden'

  const $lineByLineView = document.createElement('div');
  $parent.append($lineByLineView)
  $lineByLineView.classList.add('line-by-line-view')
  $lineByLineView.style.visibility = 'hidden'

  new Benchmark(renderToggleLineByLineExample.name).run(() => {
      $diplomaticView.style.height = px(windowHeight);

      renderDiplomaticView($diplomaticView, annotations, {
        page: page.partOf,
        showEntities: true,
        fit: 'height'
      });
      renderLineByLineView({
        $parent: $lineByLineView,
        annotations
      });
    },
  );

  let viewShown: 'line-by-line' | 'diplomatic' = 'diplomatic'

  const toggleView = () => {
    if(viewShown === 'line-by-line') {
      viewShown = 'diplomatic'
      $diplomaticView.style.visibility = 'visible'
      $lineByLineView.style.visibility = 'hidden'
      $toggle.textContent = 'show line-by-line'
    } else {
      viewShown = 'line-by-line'
      $diplomaticView.style.visibility = 'hidden'
      $lineByLineView.style.visibility = 'visible'
      $toggle.textContent = 'show diplomatic'
    }
  };

  toggleView()
  $toggle.addEventListener('click', toggleView);
}
