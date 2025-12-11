import {adjustOpacity} from "./adjustOpacity";
import {renderScan} from "./renderScan";
import {findXmlPage} from "./xml/findXmlPage";
import {debounce} from "lodash";
import {renderDiplomaticView} from "./renderDiplomaticView";
import {select} from "d3-selection";
import {IiifAnnotationPage} from "./AnnoModel";

export type D3Svg = ReturnType<typeof select<SVGSVGElement, unknown>>;

if (DEV) {
  new EventSource("/esbuild").addEventListener("change", () =>
    location.reload(),
  );
}

document.addEventListener("DOMContentLoaded", async () => {
  // const dir = "3965_selection";
  // const file = "NL-HaNA_1.04.02_3965_0177.xml";
  const dir = "data/3598_selection";
  const file = "NL-HaNA_1.04.02_3598_0797.xml";
  const jsonDir = "iiif/annotations/transcriptions"
  const jsonFile = "NL-HaNA_1.04.02_3598_0797.json";

  const $slider = document.getElementById("opacity") as HTMLInputElement;
  const $scan = document.getElementById("page-scan") as HTMLImageElement;
  const $view = document.getElementById("diplomatic-view") as HTMLDivElement;
  const $resizeHandle = document.getElementById('resize-handle') as HTMLDivElement

  adjustOpacity($view, $scan, $slider);
  $slider.addEventListener("change", () =>
    adjustOpacity($view, $scan, $slider),
  );

  const response = await fetch(`/${dir}/${file}`);
  const text = await response.text();
  const page = findXmlPage(text);

  const annoResponse = await fetch(`/${jsonDir}/${jsonFile}`);
  const annoPage: IiifAnnotationPage = await annoResponse.json();
  console.log('found', annoPage)

  const render = debounce(() => {
    const {
      width: maxWidth,
      height: maxHeight
    } = $resizeHandle.getBoundingClientRect();
    const {imageWidth, imageHeight} = page.attributes;
    const scale = Math.min(
      maxWidth / +imageWidth,
      maxHeight / +imageHeight
    );

    Object.assign(
      $view.style,
      {
        height: scale * parseInt(imageHeight),
        width: scale * parseInt(imageWidth)
      }
    )

    renderScan(page, scale, $scan, dir);
    renderDiplomaticView($view, page, annoPage);
  }, 50);

  new ResizeObserver(render).observe($resizeHandle);
});

