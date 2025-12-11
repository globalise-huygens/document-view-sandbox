import {Benchmark} from "./Benchmark";
import {select} from "d3-selection";
import {renderAnnoText} from "./renderAnnoText";
import {IiifAnnotationPage} from "./AnnoModel";

export function renderDiplomaticView(
  $view: HTMLDivElement,
  annoPage: IiifAnnotationPage
) {
  $view.innerHTML = ''

  const {width, height} = $view.getBoundingClientRect()
  const {width: scanWidth, height: scanHeight} = annoPage.partOf;

  const scale = Math.min(
    width / +scanWidth,
    height / +scanHeight
  );

  const $text = document.createElement("div");
  $view.appendChild($text);
  const $boundaries = select($view)
    .append("svg")
    .attr("id", "svgbody")
    .attr("width", width)
    .attr("height", height);

  new Benchmark(renderAnnoText.name).run(() =>
    renderAnnoText(annoPage, scale, $text, $boundaries)
  );
}