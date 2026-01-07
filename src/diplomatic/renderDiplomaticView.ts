import {select} from 'd3-selection';
import {AnnotationPage} from './AnnoModel';
import {DiplomaticViewConfig} from './DiplomaticViewConfig';

import {renderWordBoundaries} from './renderWordBoundaries';
import {px} from './px';
import {calcTextRect} from './calcTextRect';
import {findWordPositions} from "./anno/findWordPositions";
import {renderWord} from "./renderWord";
import {createHull} from "./createHull";
import {TextResizer} from "./TextResizer";

export function renderDiplomaticView(
  $view: HTMLDivElement,
  annoPage: AnnotationPage,
  config: DiplomaticViewConfig,
) {
  const {showBoundaries, showScanMargin} = config
  $view.innerHTML = '';

  const {width: viewWidth, height: viewHeight} = $view.getBoundingClientRect();

  const {width: scanWidth, height: scanHeight} = annoPage.partOf;

  const $text = document.createElement('div');
  $text.classList.add('text');
  $view.appendChild($text);

  const annotations = findWordPositions(annoPage);
  const wordHulls = annotations.map(({text, path}) => {
    return {text, hull: createHull(path)};
  })

  const marginlessRect = calcTextRect(wordHulls);

  /**
   * Add some padding to show characters at the edges
   * Characters can overflow vertically as words are fit into their
   * bounding boxes using width only.
   */
  const overflowPadding = Math.round(marginlessRect.width * 0.02)

  const scale = showScanMargin
    ? viewWidth / scanWidth
    : viewWidth / marginlessRect.width;

  if (showScanMargin) {
    $view.style.height = px(scale * scanHeight)
    $view.style.width = px(scale * scanWidth)
  } else {
    $view.style.height = px(scale * (marginlessRect.height + overflowPadding * 2))
    $view.style.width = px(scale * marginlessRect.width)
    $text.style.marginTop = px(scale * (-marginlessRect.top + overflowPadding));
    $text.style.marginLeft = px(scale * -marginlessRect.left);
  }
  const $boundaries = select($view)
    .append('svg')
    .attr('class', 'boundaries')

  if (showBoundaries) {
    const {width, height} = $view.getBoundingClientRect();

    if (showScanMargin) {
      $boundaries
        .attr('width', width)
        .attr('height', height);
    } else {
      $boundaries
        .style('margin-top', px(scale * (-marginlessRect.top + overflowPadding)))
        .style('margin-left', px(scale * -marginlessRect.left))
        .attr('width', width + scale * marginlessRect.left)
        .attr('height', height + scale * (marginlessRect.top - overflowPadding));
    }
  }

  const resizer = new TextResizer();

  const words = wordHulls.map(({text, hull}) => {
    return renderWord(text, hull, $text, scale);
  })

  resizer.calibrate(words.slice(0, 10).map(w => w.el));
  words.forEach((w) => {
    resizer.resize(w.el);
    if (showBoundaries) {
      renderWordBoundaries(w, $boundaries, scale);
    }
  });
}
