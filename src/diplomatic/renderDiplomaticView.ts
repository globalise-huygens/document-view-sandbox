import {select} from 'd3-selection';
import {IiifAnnotationPage} from './AnnoModel';
import {DiplomaticViewConfig} from './DiplomaticViewConfig';

import {renderWordBoundaries} from './renderWordBoundaries';
import {px} from './px';
import {calcWordsRect} from './calcWordsRect';
import {findWordAnnotations} from "./anno/findWordAnnotations";
import {renderWord} from "./renderWord";
import {createHull} from "./createHull";
import {TextResizer} from "./TextResizer";

export function renderDiplomaticView(
  $view: HTMLDivElement,
  annoPage: IiifAnnotationPage,
  config: DiplomaticViewConfig,
) {
  const {showBoundaries, showScanMargin} = config
  $view.innerHTML = '';

  const {width: viewWidth, height: viewHeight} = $view.getBoundingClientRect();

  const {width: scanWidth, height: scanHeight} = annoPage.partOf;

  const $text = document.createElement('div');
  $text.classList.add('text');
  $view.appendChild($text);

  const annotations = findWordAnnotations(annoPage);
  const textHulls = annotations.map(({text, points}) => {
    return {text, hull: createHull(points)};
  })

  const rect = calcWordsRect(textHulls);
  console.log({rect, textRect: $text.getBoundingClientRect().toJSON()})

  // If view has no height, calculate scale on width only:
  const scale = showScanMargin
    ? viewWidth / scanWidth
    : viewWidth / rect.width;

  if (showScanMargin) {
    $view.style.height = px(scale * scanHeight)
    $view.style.width = px(scale * scanWidth)
  } else {
    $view.style.height = px(scale * rect.height)
    $view.style.width = px(scale * rect.width)
    $text.style.marginTop = px(scale * -rect.top);
    $text.style.marginLeft = px(scale * -rect.left);
  }
  const $boundaries = select($view)
    .append('svg')

  if (showBoundaries) {
    const {width, height} = $view.getBoundingClientRect();

    if (showScanMargin) {
      $boundaries
        .attr('class', 'boundaries')
        .attr('width', width)
        .attr('height', height);
    } else {
      $boundaries
        .style('margin-top', px(scale * -rect.top))
        .style('margin-left', px(scale * -rect.left));
      $boundaries
        .attr('class', 'boundaries')
        .attr('width', width + scale * rect.left)
        .attr('height', height + scale * rect.top);
    }
  }

  const resizer = new TextResizer();

  const words = textHulls.map(({text, hull}) => {
    return renderWord(text, hull, $text, scale);
  })

  resizer.calibrate(words.slice(0, 10).map(w => w.el));
  words.forEach((w) => {
    resizer.resize(w.el);
    if(showBoundaries) {
      renderWordBoundaries(w, $boundaries, scale);
    }
  });
}
