import {adjustOpacity} from "./adjustOpacity";
import {renderScan} from "./renderScan";
import {debounce} from "lodash";
import {renderDiplomaticView} from "./renderDiplomaticView";
import {select} from "d3-selection";
import {IiifAnnotationPage} from "./AnnoModel";
import {px} from "./px";

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
  const jsonDir = "iiif/annotations/transcriptions"
  const jsonFile = "NL-HaNA_1.04.02_3598_0797.json";
  const imageFilename = "NL-HaNA_1.04.02_3598_0797.jpg";

  const $slider = document.getElementById("opacity") as HTMLInputElement;
  const $scan = document.getElementById("page-scan") as HTMLImageElement;
  const $view = document.getElementById("diplomatic-view") as HTMLDivElement;
  const $resizeHandle = document.getElementById('resize-handle') as HTMLDivElement

  adjustOpacity($view, $scan, $slider);
  $slider.addEventListener("change", () =>
    adjustOpacity($view, $scan, $slider),
  );

  const annoResponse = await fetch(`/${jsonDir}/${jsonFile}`);
  const annoPage: IiifAnnotationPage = await annoResponse.json();

  const render = debounce(() => {
    const {
      width: maxWidth,
      height: maxHeight
    } = $resizeHandle.getBoundingClientRect();
    const {width, height} = annoPage.partOf;
    const scale = Math.min(
      maxWidth / +height,
      maxHeight / +height
    );

    $view.style.height = px(scale * height)
    $view.style.width = px(scale * width)

    const pageAttributes = {height, width, imageFilename};
    renderScan(pageAttributes, scale, $scan, dir.replace('data', ''));
    renderDiplomaticView($view, annoPage);
  }, 50);

  new ResizeObserver(render).observe($resizeHandle);
});

