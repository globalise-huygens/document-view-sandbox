import {XmlElement} from "@rgrove/parse-xml";
import {Benchmark} from "./Benchmark";
import {renderXmlText} from "./renderXmlText";
import {select} from "d3-selection";
import {renderAnnoText} from "./renderAnnoText";
import {IiifAnnotationPage} from "./AnnoModel";

export function renderDiplomaticView(
  $view: HTMLDivElement,
  page: XmlElement,
  annos: IiifAnnotationPage
) {
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

  new Benchmark(renderXmlText.name).run(() =>
    renderAnnoText(page, annos, scale, $text, $boundaries),
  );
}