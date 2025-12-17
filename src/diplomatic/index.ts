import {renderScan} from './renderScan';
import {renderDiplomaticView} from './renderDiplomaticView';
import {Selection} from 'd3-selection';
import {IiifAnnotationPage} from './AnnoModel';
import {px} from './px';
import {orThrow} from "../util/orThrow";

export type D3Svg = Selection<SVGSVGElement, unknown, null, undefined>;

if (DEV) {
  new EventSource('/esbuild').addEventListener('change', () =>
    location.reload(),
  );
}

document.addEventListener('DOMContentLoaded', async () => {
  const example = new URLSearchParams(location.search).get('example')
    ?? 'with-scan'
  $('a.' + example).classList.add('active')
  const $example = $('#example')

  if (example === 'with-scan') {
    await renderScanExample($example)
  } else {
    await renderTextOnlyExample($example)
  }
});

async function renderScanExample($parent: HTMLElement) {
  const jsonPath = "../data/3965_selection/NL-HaNA_1.04.02_3965_0177.json";
  const scanPath = "../images/3965_selection/NL-HaNA_1.04.02_3965_0177.jpg";

  $parent.classList.add('with-scan')
  $parent.innerHTML = `
      <div class="diplomatic-view"></div>
      <img id="scan" alt="scan"/>`
  const $menu = $('#menu')
  const $view: HTMLDivElement = $('.diplomatic-view', $parent);
  const $scan: HTMLImageElement = $('#scan', $parent);

  const $slider = document.createElement('span')
  $menu.appendChild($slider)
  $slider.classList.add('slider')
  $slider.innerHTML = `
    text 
    <input type="range" value="20" min="0" max="100"/> 
    scan`
  const $input: HTMLInputElement = $('input', $slider)

  const adjustOpacity = () => {
    const opacity = parseInt($input.value);
    $scan.style.opacity = `${opacity}%`;
    $view.style.opacity = `${100 - opacity}%`;
  };

  adjustOpacity();
  $slider.addEventListener('input', adjustOpacity);

  const annoResponse = await fetch(jsonPath);
  const annoPage: IiifAnnotationPage = await annoResponse.json();
  const {width: parentWidth} = $parent.getBoundingClientRect();
  const {width, height} = annoPage.partOf;

  const scale = Math.max(parentWidth / +width);
  $view.style.height = px(scale * height);
  $view.style.width = px(scale * width);

  const pageAttributes = {height, width, scanPath};
  renderScan(pageAttributes, scale, $scan);
  const viewConfig = {showBoundaries: false, showScanMargin: true};
  renderDiplomaticView($view, annoPage, viewConfig);
}

async function renderTextOnlyExample(
  $parent: HTMLElement
) {

  const jsonPath = '../iiif/annotations/transcriptions/NL-HaNA_1.04.02_3598_0797.json';
  const scanPath = '../images/3598_selection/NL-HaNA_1.04.02_3598_0797.jpg';

  $parent.classList.add('text-only')
  $parent.innerHTML = `<div class="diplomatic-view"></div>`
  const $menu = $('#menu')
  const $view: HTMLDivElement = $('.diplomatic-view', $parent);
  const $slider = document.createElement('span')
  $menu.appendChild($slider)
  $slider.classList.add('slider')
  $slider.innerHTML = `
    zoom: min 
    <input type="range" value="20" min="0" max="100"/> 
    max`
  const $input: HTMLInputElement = $('input', $slider)

  const adjustScale = () => {
    const scale = parseInt($input.value);
    console.log('scale', scale)
  }

  adjustScale();
  $slider.addEventListener('drag', adjustScale);

  const annoResponse = await fetch(jsonPath);
  const annoPage: IiifAnnotationPage = await annoResponse.json();
  const {width: parentWidth} = $parent.getBoundingClientRect();
  const {width, height} = annoPage.partOf;

  const scale = Math.max(parentWidth / +width);
  $view.style.height = px(scale * height);
  $view.style.width = px(scale * width);

  const viewConfig = {showBoundaries: true, showScanMargin: false};
  renderDiplomaticView($view, annoPage, viewConfig);
}



export function $<T extends HTMLElement>(
  selector: string,
  parent: HTMLElement | Document = document
): T {
  return parent.querySelector(selector) ?? orThrow(`${selector} not found`);
}