import {adjustOpacity} from './adjustOpacity';
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
    await renderTextOnlyExample()
  }
});

async function renderScanExample($parent: HTMLElement) {
  $parent.classList.add('with-scan')
  $parent.innerHTML = `
      <div id="menu"></div>
      <div class="diplomatic-view"></div>
      <img id="scan"/>`
  const $menu = $('#menu')
  $menu.classList.add('with-scan')
  const $view: HTMLDivElement = $('.diplomatic-view', $parent);
  const $scan: HTMLImageElement = $('#scan', $parent);
  const $slider = document.createElement('span')
  $menu.appendChild($slider)
  renderSlider($slider, $view, $scan);

  const jsonPath = "/data/3965_selection/NL-HaNA_1.04.02_3965_0177.json";
  const scanPath = "/images/3965_selection/NL-HaNA_1.04.02_3965_0177.jpg";

  const annoResponse = await fetch(jsonPath);
  const annoPage: IiifAnnotationPage = await annoResponse.json();
  const {width: parentWidth} = $parent.getBoundingClientRect();
  const {width, height} = annoPage.partOf;

  const scale = Math.max(parentWidth / +width);
  let newHeight = px(scale * height);
  $view.style.height = newHeight;
  let newWidth = px(scale * width);
  $view.style.width = newWidth;
  console.log('scale', {newWidth, newHeight, parentWidth, scale})

  const pageAttributes = {height, width, scanPath};
  renderScan(pageAttributes, scale, $scan);
  const viewConfig = {showBoundaries: false, showScanMargin: true};
  renderDiplomaticView($view, annoPage, viewConfig);
}

function renderSlider(
  $parent: HTMLElement,
  $view: HTMLDivElement,
  $scan: HTMLImageElement
) {
  $parent.classList.add('slider')
  $parent.innerHTML = `
    text 
    <input type="range" value="20" min="0" max="100"/> 
    scan`
  const $input: HTMLInputElement = $('input', $parent)
  adjustOpacity($view, $scan, $input);
  $parent.addEventListener('input', () =>
    adjustOpacity($view, $scan, $input),
  );
}

async function renderTextOnlyExample() {}

export function $<T extends HTMLElement>(
  selector: string,
  parent: HTMLElement | Document = document
): T {
  return parent.querySelector(selector) ?? orThrow(`${selector} not found`);
}