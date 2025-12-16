import {Benchmark} from './Benchmark';
import {select, Selection} from 'd3-selection';
import {renderAnnoText} from './renderAnnoText';
import {IiifAnnotationPage} from './AnnoModel';
import {DiplomaticViewConfig} from './DiplomaticViewConfig';

import {renderWordBoundaries} from './renderWordBoundaries';
import {px} from './px';
import {calcMargin} from './calcMargin';
import {D3Svg} from "./index";

export function renderDiplomaticView(
  $view: HTMLDivElement,
  annoPage: IiifAnnotationPage,
  config: DiplomaticViewConfig,
) {
  $view.innerHTML = '';

  const {width, height} = $view.getBoundingClientRect();
  const {width: scanWidth, height: scanHeight} = annoPage.partOf;

  const scale = Math.min(width / +scanWidth, height / +scanHeight);

  const $text = document.createElement('div');
  $text.classList.add('text');
  $view.appendChild($text);

  new Benchmark(renderAnnoText.name).run(() => {
    const {words} = renderAnnoText(annoPage, scale, $text);
    let $boundaries: D3Svg | null = null;
    if (config.showBoundaries) {
      $boundaries = select($view)
        .append('svg')
        .attr('class', 'boundaries')
        .attr('width', width)
        .attr('height', height);
      words.forEach((word) => renderWordBoundaries(word, $boundaries!, scale));
    }
    if (!config.showScanMargin) {
      const margin = calcMargin(words, scale);
      $text.style.marginTop = px(-margin.top);
      $text.style.marginLeft = px(-margin.left);
      $boundaries
        ?.style('display', 'block')
        ?.style('margin-top', px(-margin.top))
        .style('margin-left', px(-margin.left));
    }
  });
}
