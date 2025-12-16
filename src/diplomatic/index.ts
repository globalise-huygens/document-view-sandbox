import { adjustOpacity } from './adjustOpacity';
import { renderScan } from './renderScan';
import { debounce } from 'lodash';
import { renderDiplomaticView } from './renderDiplomaticView';
import {select, Selection} from 'd3-selection';
import { IiifAnnotationPage } from './AnnoModel';
import { px } from './px';
import { orThrow } from '../util/orThrow';

export type D3Svg = Selection<SVGSVGElement, unknown, null, undefined>

if (DEV) {
  new EventSource('/esbuild').addEventListener('change', () =>
    location.reload(),
  );
}

export function $<T extends HTMLElement>(selector: string): T {
  return document.querySelector(selector) ?? orThrow(`${selector} not found`);
}

document.addEventListener('DOMContentLoaded', async () => {
  const jsonPath =
    '/iiif/annotations/transcriptions/NL-HaNA_1.04.02_3598_0797.json';
  const scanPath = '/images/3598_selection/NL-HaNA_1.04.02_3598_0797.jpg';
  // const jsonPath = "/data/3965_selection/NL-HaNA_1.04.02_3965_0177.json";
  // const scanPath = "/images/3965_selection/NL-HaNA_1.04.02_3965_0177.jpg";

  const $slider: HTMLInputElement = $('#opacity');
  const $scan: HTMLImageElement = $('#page-scan');
  const $view: HTMLDivElement = $('#diplomatic-view');
  const $resizeHandle: HTMLDivElement = $('#resize-handle');

  adjustOpacity($view, $scan, $slider);
  $slider.addEventListener('change', () =>
    adjustOpacity($view, $scan, $slider),
  );

  const annoResponse = await fetch(jsonPath);
  const annoPage: IiifAnnotationPage = await annoResponse.json();

  const render = debounce(() => {
    const { width: maxWidth, height: maxHeight } =
      $resizeHandle.getBoundingClientRect();
    const { width, height } = annoPage.partOf;
    const scale = Math.min(maxWidth / +height, maxHeight / +height);

    $view.style.height = px(scale * height);
    $view.style.width = px(scale * width);

    const pageAttributes = { height, width, scanPath };
    renderScan(pageAttributes, scale, $scan);
    const viewConfig = { showBoundaries: true, showScanMargin: false };
    renderDiplomaticView($view, annoPage, viewConfig);
  }, 50);

  new ResizeObserver(render).observe($resizeHandle);
});
