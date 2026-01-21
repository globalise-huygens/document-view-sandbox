import { AnnotationPage } from '../AnnoModel';
import { px } from '../px';
import { renderScan } from './renderScan';
import { renderDiplomaticView } from '../renderDiplomaticView';
import { $ } from './$';
import { FullOriginalLayoutConfig } from '../renderOriginalLayout';
import { mapAnnotationsById } from './mapAnnotationsById';

export async function renderScanExample($parent: HTMLElement) {
  const jsonPath = '../data/3965_selection/NL-HaNA_1.04.02_3965_0177.json';
  const scanPath = '../images/3965_selection/NL-HaNA_1.04.02_3965_0177.jpg';

  $parent.classList.add('with-scan');
  $parent.innerHTML = `
      <div class="diplomatic-view"></div>
      <img id="scan" alt="scan"/>`;
  const $menu = $('#menu');
  const $view: HTMLDivElement = $('.diplomatic-view', $parent);
  const $scan: HTMLImageElement = $('#scan', $parent);

  const $slider = document.createElement('span');
  $menu.appendChild($slider);
  $slider.classList.add('slider');
  $slider.innerHTML = `
    text 
    <input type="range" value="20" min="0" max="100"/> 
    scan`;
  const $input: HTMLInputElement = $('input', $slider);

  const adjustOpacity = () => {
    const opacity = parseInt($input.value);
    $scan.style.opacity = `${opacity}%`;
    $view.style.opacity = `${100 - opacity}%`;
  };

  adjustOpacity();
  $slider.addEventListener('input', adjustOpacity);

  const annoResponse = await fetch(jsonPath);
  const page: AnnotationPage = await annoResponse.json();
  const { width: parentWidth } = $parent.getBoundingClientRect();
  const { width, height } = page.partOf;

  const scale = Math.max(parentWidth / +width);
  $view.style.height = px(scale * height);
  $view.style.width = px(scale * width);

  const pageAttributes = { height, width, scanPath };
  renderScan(pageAttributes, scale, $scan);
  const viewConfig: FullOriginalLayoutConfig = {
    showBoundaries: false,
    showScanMargin: true,
    fit: 'contain',
    page: page.partOf,
  };
  const annotations = mapAnnotationsById(page.items);
  renderDiplomaticView($view, annotations, viewConfig);
}
