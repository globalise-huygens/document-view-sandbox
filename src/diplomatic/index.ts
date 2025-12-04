import {select} from "d3-selection";
import {adjustOpacity} from "./adjustOpacity";
import {renderText} from "./renderText";
import {renderScan} from "./renderScan";
import {Benchmark} from "./Benchmark";
import {findXmlPage} from "./xml/findXmlPage";

export type D3Svg = ReturnType<typeof select<SVGSVGElement, unknown>>;

if (DEV) {
  new EventSource("/esbuild").addEventListener("change", () =>
    location.reload(),
  );
}

document.addEventListener("DOMContentLoaded", async () => {
  const scale = 0.5;
  const dir = "3965_selection";
  const file = "NL-HaNA_1.04.02_3965_0177.xml";

  const $slider = document.getElementById("opacity") as HTMLInputElement;
  const $scan = document.getElementById("page-scan") as HTMLImageElement;
  const $view = document.getElementById("diplomatic-view") as HTMLDivElement
  const $boundaries = select($view)
    .append("svg")
    .attr("id", "svgbody")
    .attr("width", 4000)
    .attr("height", 5500);

  adjustOpacity($view, $scan, $slider);
  $slider.addEventListener("change", () => adjustOpacity($view, $scan, $slider));

  const $text = document.createElement("div");
  $view.appendChild($text);

  const response = await fetch(`/data/${dir}/${file}`)
  const text = await response.text();
  const page = findXmlPage(text);
  renderScan(page, scale, $scan, dir);
  new Benchmark(renderText.name).run(
    () => renderText(page, scale, $text, $boundaries)
  )
});

