import {select} from "d3-selection";
import {adjustOpacity} from "./adjustOpacity";
import {renderText} from "./renderText";
import {renderScan} from "./renderScan";
import {Benchmark} from "./Benchmark";
import {findXmlPage} from "./xml/findXmlPage";
import {debounce} from "lodash";

export type D3Svg = ReturnType<typeof select<SVGSVGElement, unknown>>;

if (DEV) {
  new EventSource("/esbuild").addEventListener("change", () =>
    location.reload(),
  );
}

document.addEventListener("DOMContentLoaded", async () => {
  const dir = "3965_selection";
  const file = "NL-HaNA_1.04.02_3965_0177.xml";

  const $slider = document.getElementById("opacity") as HTMLInputElement;
  const $scan = document.getElementById("page-scan") as HTMLImageElement;
  const $view = document.getElementById("diplomatic-view") as HTMLDivElement;
  const $boundaries = select($view)
    .append("svg")
    .attr("id", "svgbody");

  adjustOpacity($view, $scan, $slider);
  $slider.addEventListener("change", () =>
    adjustOpacity($view, $scan, $slider),
  );

  const $text = document.createElement("div");
  $view.appendChild($text);

  const response = await fetch(`/data/${dir}/${file}`);
  const text = await response.text();
  const page = findXmlPage(text);

  const {width: viewWidth, height: viewHeight} = $view.getBoundingClientRect();
  const $resizeHandle = document.createElement('div') as HTMLDivElement

  $resizeHandle.classList.add('resize-handle')
  $view.appendChild($resizeHandle)
  Object.assign($resizeHandle.style, {
    overflow: 'auto',
    resize: 'both',
    width: px(viewWidth),
    height: px(viewHeight),
    border: '3px solid pink',
    position: 'absolute',
    top: 0,
    left: 0,
    boxSizing: 'border-box',
  })

  const {imageWidth, imageHeight} = page.attributes;

  const render = debounce(() => {
    const {
      width: maxWidth,
      height: maxHeight
    } = $resizeHandle.getBoundingClientRect();
    const scale = Math.min(
      maxWidth / +imageWidth,
      maxHeight / +imageHeight
    );

    $scan.innerHTML = ''
    $text.innerHTML = ''
    $boundaries
      .selectAll("*")
      .remove()

    renderScan(page, scale, $scan, dir);
    new Benchmark(renderText.name).run(() =>
      renderText(page, scale, $text, $boundaries),
    );
    console.log('render', Date.now())
  }, 250);
  new ResizeObserver(render).observe($resizeHandle);
  render()

});

export function px(amount: string | number) {
  return `${amount}px`
}
