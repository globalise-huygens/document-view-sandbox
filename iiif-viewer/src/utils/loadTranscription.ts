import type { Annotation, AnnotationPage } from "@iiif/presentation-3";
import { useViewerStore } from "../stores/viewer-store";
import type OpenSeadragon from "openseadragon";

let annotationTooltip: HTMLDivElement;

export function loadTranscription(annoPage: AnnotationPage | null) {
  if (!annoPage || !annoPage.items) return;
  const viewer = useViewerStore.getState().viewer;
  if (!viewer) return;

  const item = getViewerItem(viewer, 0);
  if (!item) return;

  const size = item.getContentSize();
  const imageRect = item.imageToViewportRectangle(0, 0, size.x, size.y);

  annoPage.items
    .filter((anno) => anno.motivation === "supplementing")
    .forEach((anno) => {
      processAnnotation(anno, size, imageRect, viewer);
    });
}

function processAnnotation(
  anno: Annotation,
  size: OpenSeadragon.Point,
  imageRect: OpenSeadragon.Rect,
  viewer: OpenSeadragon.Viewer
) {
  const textualBody = anno.body?.find((body) => body.type === "TextualBody");
  if (!textualBody) return;

  const text = textualBody.value;

  const specific = anno.target?.find((t) => t.type === "SpecificResource");
  if (!specific || !specific.selector) return;

  const svgFragment = specific.selector.value;
  if (!svgFragment) return;

  const overlayElement = createSvgOverlayFromFragment(svgFragment, size, text);
  if (!overlayElement) return;

  viewer.addOverlay({
    element: overlayElement,
    location: imageRect,
  });
}

function createSvgOverlayFromFragment(
  svgFragment: string,
  size: OpenSeadragon.Point,
  text: string
) {
  const svgContainer = document.createElement("div");
  svgContainer.style.position = "absolute";
  svgContainer.style.pointerEvents = "none";

  const svgElement = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "svg"
  );
  svgElement.setAttribute("viewBox", `0 0 ${size.x} ${size.y}`);
  svgElement.style.width = "100%";
  svgElement.style.height = "100%";
  svgElement.style.pointerEvents = "none";

  const svgGroup = createSvgGroupFromFragment(svgFragment);
  if (!svgGroup) return null;

  svgGroup.style.pointerEvents = "none";
  attachShapeListeners(svgGroup, text);

  svgElement.appendChild(svgGroup);
  svgContainer.appendChild(svgElement);

  return svgContainer;
}

function createSvgGroupFromFragment(svgFragment: string) {
  try {
    const wrapped = `<svg xmlns="http://www.w3.org/2000/svg">${svgFragment}</svg>`;
    const parsed = new DOMParser().parseFromString(wrapped, "image/svg+xml");
    const parsedRoot = parsed.documentElement;

    const svgGroup = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "g"
    );
    Array.from(parsedRoot.childNodes).forEach((node) => {
      svgGroup.appendChild(document.importNode(node, true));
    });

    return svgGroup;
  } catch (err) {
    console.error(err);
    return null;
  }
}

function attachShapeListeners(svgGroup: SVGElement, text: string) {
  const shapes = svgGroup.querySelectorAll<SVGElement>(
    "path, polygon, polyline, rect, circle, ellipse"
  );
  shapes.forEach((shape) => {
    shape.setAttribute("fill", "transparent");
    shape.style.pointerEvents = "auto";
    shape.style.cursor = "pointer";

    shape.addEventListener("mouseenter", (evt) => {
      //   console.log(evt);
      showTooltip(text, evt);
      shape.dataset._origFill = shape.getAttribute("fill") ?? "";
      shape.dataset._origStroke = shape.getAttribute("stroke") ?? "";
      shape.setAttribute("fill", "rgba(0,0,0,0.15)");
    });

    shape.addEventListener("mousemove", (evt) => {
      const tooltip = annotationTooltip;
      if (tooltip && tooltip.style.opacity === "1") {
        showTooltip(text, evt);
      }
    });

    shape.addEventListener("mouseleave", () => {
      hideTooltip();
      shape.setAttribute("fill", "transparent");
    });
  });
}

function getViewerItem(viewer: OpenSeadragon.Viewer, id: number) {
  return viewer.world.getItemAt(id);
}

function createTooltip() {
  if (!annotationTooltip) {
    annotationTooltip = document.createElement("div");
    annotationTooltip.id = "annotation-tooltip";
    annotationTooltip.style.cssText = [
      "position:absolute",
      "background:rgba(0,0,0,0.85)",
      "color:#fff",
      "padding:6px 10px",
      "border-radius:4px",
      "font:13px/1.3 system-ui, sans-serif",
      "max-width:320px",
      "pointer-events:none",
      "z-index:99999",
      "opacity:0",
      "transition:opacity .15s ease",
      "box-shadow:0 2px 6px rgba(0,0,0,.35)",
      "white-space:pre-wrap",
    ].join(";");
    document.body.appendChild(annotationTooltip);
  }

  return annotationTooltip;
}

function showTooltip(text: string, event: MouseEvent) {
  const tooltip = createTooltip();
  tooltip.textContent = text;
  tooltip.style.opacity = "1";
  const margin = 12;
  const rect = tooltip.getBoundingClientRect();
  let x = event.clientX + margin;
  let y = event.clientY - rect.height - margin;
  if (x + rect.width + 4 > window.innerWidth) {
    x = window.innerWidth - rect.width - 4;
  }
  if (y < 4) y = event.clientY + margin;
  tooltip.style.left = x + "px";
  tooltip.style.top = y + "px";
}

function hideTooltip() {
  if (annotationTooltip) annotationTooltip.style.opacity = "0";
}
