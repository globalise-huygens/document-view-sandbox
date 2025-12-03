import {select} from "d3-selection";
import {resizeText} from "./resizeText";
import {adjustOpacity} from "./adjustOpacity";
import {renderXmlDoc} from "./renderXmlDoc";

export type D3Svg = ReturnType<typeof select<SVGSVGElement, unknown>>;


if (DEV) {
  new EventSource("/esbuild").addEventListener("change", () =>
    location.reload(),
  );
}

// https://dev.to/jankapunkt/make-text-fit-it-s-parent-size-using-javascript-m40

const observer = new MutationObserver((mutationList, observer) => {
  for (const mutations of mutationList) {
    if (mutations.type === "childList") {
      for (const added of mutations.addedNodes) {
        if (added instanceof HTMLElement && added.className === "text") {
          resizeText(added);
          // TODO: remember the font weight and use it as a starting point for the next
        }
      }
    }
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const scale = 0.5;
  const dir = "3598_selection";
  const file = "NL-HaNA_1.04.02_3598_0797.xml";

  const $slider = document.getElementById("opacity") as HTMLInputElement;
  const $scan = document.getElementById("page-scan") as HTMLImageElement;
  const $view = document.getElementById("diplomatic-view")
  const $boundaries = select($view)
    .append("svg")
    .attr("id", "svgbody")
    .attr("width", 4000)
    .attr("height", 5500);

  const $text = document.createElement("div");
  $text.classList.add("text");
  $view.appendChild($text);

  adjustOpacity($view, $scan, $slider);
  $slider.addEventListener("change", () => adjustOpacity($view, $scan, $slider));

  observer.observe($text, {attributes: false, childList: true, subtree: true});

  fetch(`/data/${dir}/${file}`)
    .then((response) => response.text())
    .then((response) => renderXmlDoc(response, scale, $text, $boundaries, $scan, dir));

});

