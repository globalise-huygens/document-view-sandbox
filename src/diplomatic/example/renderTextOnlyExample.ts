import { AnnotationPage } from '../AnnoModel';
import { px } from '../px';
import { renderDiplomaticView } from '../renderDiplomaticView';
import { $ } from './$';
import { Benchmark } from '../Benchmark';

export async function renderTextOnlyExample($parent: HTMLElement) {
  const jsonPath =
    '../iiif/annotations/transcriptions/NL-HaNA_1.04.02_3598_0797.json';
  // const jsonPath = "../data/3965_selection/NL-HaNA_1.04.02_3965_0177.json";
  // const jsonPath = '../iiif/annotations/transcriptions/NL-HaNA_1.04.02_3598_0799.json';
  // const jsonPath = '../iiif/annotations/transcriptions/NL-HaNA_1.04.02_3598_1007.json';
  // const jsonPath = '../iiif/annotations/transcriptions/NL-HaNA_1.04.02_3598_1012.json';

  $parent.classList.add('text-only');
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

  const annoResponse = await fetch(jsonPath);
  const annoPage: AnnotationPage = await annoResponse.json();

  const { width: parentWidth } = $parent.getBoundingClientRect();
  const { width } = annoPage.partOf;

  const adjustScale = () => {
    const sliderScale = parseInt($input.value) / 100;
    const scale = Math.max(parentWidth / +width) * sliderScale;
    $view.style.height = px(0);
    $view.style.width = px(scale * width);
    new Benchmark(renderDiplomaticView.name).run(() =>
      renderDiplomaticView($view, annoPage),
    );
  };

  $slider.addEventListener('change', adjustScale);
  adjustScale();
}
