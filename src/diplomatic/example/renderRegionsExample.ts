import { AnnotationPage } from '../AnnoModel';
import { px } from '../px';
import {
  DiplomaticViewConfig,
  renderDiplomaticView,
} from '../renderDiplomaticView';
import { $ } from './$';
import { Benchmark } from '../Benchmark';
import { mapAnnotationsById } from './mapAnnotationsById';

export async function renderRegionsExample($parent: HTMLElement) {
  const pagePath =
    '../iiif/annotations/transcriptions/NL-HaNA_1.04.02_3598_0797.json';
  const entityPath =
    '../iiif/annotations/entities/NL-HaNA_1.04.02_3598_0797.json';
  // const pagePath = "../data/3965_selection/NL-HaNA_1.04.02_3965_0177.json";
  // const pagePath = '../iiif/annotations/transcriptions/NL-HaNA_1.04.02_3598_0799.json';
  // const pagePath = '../iiif/annotations/transcriptions/NL-HaNA_1.04.02_3598_1007.json';
  // const pagePath = '../iiif/annotations/transcriptions/NL-HaNA_1.04.02_3598_1012.json';

  $parent.classList.add('with-regions');
  $parent.innerHTML = `<div class="diplomatic-view"></div>`;
  const $menu = $('#menu');
  const $view: HTMLDivElement = $('.diplomatic-view', $parent);
  const $slider = document.createElement('span');
  $menu.appendChild($slider);
  $slider.classList.add('slider');
  $slider.innerHTML = `
    zoom: min 
    <input type="range" value="42" min="30" max="200"/> 
    max`;
  const $input: HTMLInputElement = $('input', $slider);

  const pageResponse = await fetch(pagePath);
  const page: AnnotationPage = await pageResponse.json();
  const annotations = mapAnnotationsById(page.items);

  const { width: parentWidth } = $parent.getBoundingClientRect();
  const { width } = page.partOf;
  const config: DiplomaticViewConfig = {
    showRegions: true,
    page: page.partOf,
  };

  const adjustScale = () => {
    const sliderScale = parseInt($input.value) / 100;
    const scale = Math.max(parentWidth / +width) * sliderScale;
    $view.style.height = px(0);
    $view.style.width = px(scale * width);
    new Benchmark(renderDiplomaticView.name).run(() =>
      renderDiplomaticView($view, annotations, config),
    );
  };

  $slider.addEventListener('change', adjustScale);
  adjustScale();
}
