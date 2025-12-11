import {XmlElement} from "@rgrove/parse-xml";
import {Benchmark} from "./Benchmark";
import {renderText} from "./renderText";
import {select} from "d3-selection";

export function renderDiplomaticView($view: HTMLDivElement, page: XmlElement) {
  $view.innerHTML = ''

  const {width, height} = $view.getBoundingClientRect()
  const {imageWidth, imageHeight} = page.attributes;

  const scale = Math.min(
    width / +imageWidth,
    height / +imageHeight
  );

  const $text = document.createElement("div");
  $view.appendChild($text);
  const $boundaries = select($view)
    .append("svg")
    .attr("id", "svgbody")
    .attr("width", width)
    .attr("height", height);

  new Benchmark(renderText.name).run(() =>
    renderText(page, scale, $text, $boundaries),
  );
}