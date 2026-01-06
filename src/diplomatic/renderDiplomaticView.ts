import {Benchmark} from './Benchmark';
import {select, Selection} from 'd3-selection';
import {renderAnnoText} from './renderAnnoText';
import {IiifAnnotationPage} from './AnnoModel';
import {DiplomaticViewConfig} from './DiplomaticViewConfig';

import {renderWordBoundaries} from './renderWordBoundaries';
import {px} from './px';
import {calcWordsRect} from './calcWordsRect';
import {D3Svg} from "./index";

export function renderDiplomaticView(
  $view: HTMLDivElement,
  annoPage: IiifAnnotationPage,
  config: DiplomaticViewConfig,
) {
  $view.innerHTML = '';

  const {width: viewWidth, height: viewHeight} = $view.getBoundingClientRect();
  const {width: scanWidth, height: scanHeight} = annoPage.partOf;

  // If view has no height, calculate scale on width only:
  const scale = viewHeight
    ? Math.min(viewWidth / +scanWidth, viewHeight / +scanHeight)
    : viewWidth / +scanWidth;

  const $text = document.createElement('div');
  $text.classList.add('text');
  $view.appendChild($text);

  const {words} = renderAnnoText(annoPage, scale, $text);

  const rect = calcWordsRect(words, $text);
  if (config.showScanMargin) {
    $view.style.height = px(scale * scanHeight)
    $view.style.width = px(scale * scanWidth)
  } else {
    $view.style.height = px(rect.height)
    $view.style.width = px(rect.width)
    $text.style.marginTop = px(-rect.top);
    $text.style.marginLeft = px(-rect.left);
  }
  if (config.showBoundaries) {
    const $boundaries = select($view)
      .append('svg')
    const {width, height} = $view.getBoundingClientRect();

    if (config.showScanMargin) {
      $boundaries
        .attr('class', 'boundaries')
        .attr('width', width)
        .attr('height', height);
    } else {
      $boundaries
        .style('margin-top', px(-rect.top))
        .style('margin-left', px(-rect.left));
      $boundaries
        .attr('class', 'boundaries')
        .attr('width', width + rect.left)
        .attr('height', height + rect.top);
    }

    words.forEach((word) => renderWordBoundaries(word, $boundaries, scale));
  }
}
