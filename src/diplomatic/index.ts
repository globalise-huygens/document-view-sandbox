import {parseXml} from "@rgrove/parse-xml";

import {select} from "d3-selection";
import {isXmlElement} from "./isXmlElement";
import {assertXmlElement} from "./assertXmlElement";
import {assertXmlText} from "./assertXmlText";
import {resizeText} from "./resizeText";
import {renderWord} from "./renderWord";

const scale = 0.5;
let opacity: number;
export type D3Svg = ReturnType<typeof select<SVGSVGElement, unknown>>;

let $boundaries: D3Svg;

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

const docSelection = "3598_selection";
const docName = "NL-HaNA_1.04.02_3598_0797";

const adjustOpacity = (
  $view: HTMLElement,
  $scan: HTMLImageElement,
  $slider: HTMLInputElement
) => {
  opacity = parseInt($slider.value);
  $scan.style.opacity = `${opacity}%`;
  $view.style.opacity = `${100 - opacity}%`;
};

document.addEventListener("DOMContentLoaded", () => {
  const $slider = document.getElementById("opacity") as HTMLInputElement;
  const $scan = document.getElementById("page-scan") as HTMLImageElement;
  const $view = document.getElementById("diplomatic-view")

  $boundaries = select($view)
    .append("svg")
    .attr("id", "svgbody")
    .attr("width", 4000)
    .attr("height", 5500);

  adjustOpacity($view, $scan, $slider);
  $slider.addEventListener("change", () => adjustOpacity($view, $scan, $slider));

  const $text = document.createElement("div");
  $text.classList.add("text");
  $view.appendChild($text);

  observer.observe($text, {
    attributes: false,
    childList: true,
    subtree: true,
  });

  fetch(`/data/${docSelection}/${docName}.xml`)
    .then((response) => response.text())
    .then((body) => {
      const xml = parseXml(body);
      const doc = xml.children[0];
      if (!isXmlElement(doc)) {
        throw new Error("Expected XmlElement")
      }
      const firstPage = doc.children
        .filter((x) => {
          return x["name"] === "Page";
        })[0];
      if (!isXmlElement(firstPage)) {
        throw new Error("Expected XmlElement")
      }

      const {imageFilename, imageWidth, imageHeight} = firstPage.attributes;
      const imageStyle = `
        position: absolute;
        left: 0;
        top: 0;
        width: ${scale * parseInt(imageWidth)}px;
        height: ${scale * parseInt(imageHeight)}px;
        border-style: none;
        z-index: -1;
      `;
      const bodyStyle = `
        position: absolute;
        left: 0;
        top: 0;
        width: ${scale * parseInt(imageWidth)}px;
        height: ${scale * parseInt(imageHeight)}px;
      `;

      const regions = firstPage.children.filter((x) => x["name"] === "TextRegion");

      for (const region of regions) {
        assertXmlElement(region);
        const lines = region.children
          .filter((x) => x["name"] === "TextLine");
        for (const line of lines) {
          assertXmlElement(line);
          const words = line.children
            .filter((x) => x["name"] === "Word");
          for (const word of words) {
            assertXmlElement(word);
            const coords = word.children
              .find((x) => x["name"] === "Coords");
            assertXmlElement(coords);
            const points = coords.attributes["points"];
            const textEquiv = word.children
              .find((x) => x["name"] === "TextEquiv");
            assertXmlElement(textEquiv);
            const unicode = textEquiv.children
              .find((x) => x["name"] === "Unicode");
            assertXmlElement(unicode);
            const textChild = unicode.children[0];
            assertXmlText(textChild);
            const text = textChild.text;
            renderWord(text, points, $text, $boundaries, scale);
          }
        }
      }

      $scan.src = `/images/${docSelection}/${imageFilename}`;
      $scan.style.cssText = imageStyle;
      const bodyEl = document.getElementsByTagName("body")[0];
      bodyEl.style.cssText = bodyStyle;
    });
});

if (DEV) {
  new EventSource("/esbuild").addEventListener("change", () =>
    location.reload(),
  );
}
