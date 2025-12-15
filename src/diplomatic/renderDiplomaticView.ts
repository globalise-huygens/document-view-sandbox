import {Benchmark} from "./Benchmark";
import {select} from "d3-selection";
import {renderAnnoText} from "./renderAnnoText";
import {IiifAnnotationPage} from "./AnnoModel";
import {DiplomaticViewConfig} from "./DiplomaticViewConfig";

import {renderWordBoundaries} from "./renderWordBoundaries";

export function renderDiplomaticView(
  $view: HTMLDivElement,
  annoPage: IiifAnnotationPage,
  config: DiplomaticViewConfig
) {
  $view.innerHTML = "";

  const {width, height} = $view.getBoundingClientRect();
  const {width: scanWidth, height: scanHeight} = annoPage.partOf;

  const scale = Math.min(width / +scanWidth, height / +scanHeight);

  const $text = document.createElement("div");
  $view.appendChild($text);

  new Benchmark(renderAnnoText.name).run(() => {
    const {words} = renderAnnoText(annoPage, scale, $text)
    if (config.showBoundaries) {
      const $boundaries = select($view)
        .append("svg")
        .attr("id", "svgbody")
        .attr("width", width)
        .attr("height", height);
      words.forEach(word =>
        renderWordBoundaries(word, $boundaries, scale)
      )
    }
  });

}
