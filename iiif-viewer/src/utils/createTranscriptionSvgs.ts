import type { AnnotationPage } from "@iiif/presentation-3";
import type OpenSeadragon from "openseadragon";

export function createTranscriptionSvgs(
  annoPage: AnnotationPage | null,
  size: OpenSeadragon.Point
) {
  if (!annoPage) return;

  const svgContainers = annoPage.items
    ?.filter((ap) => ap.motivation === "supplementing")
    .map((anno) => {
      const specific = anno.target?.find((t) => t.type === "SpecificResource");
      if (!specific || !specific.selector) return;

      const svgFragment = specific.selector.value;

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

      const svgGroup = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "g"
      );
      svgGroup.innerHTML = svgFragment;
      svgGroup.style.pointerEvents = "none";

      svgGroup
        .querySelectorAll<SVGElement>(
          "path, polygon, polyline, rect, circle, ellipse"
        )
        .forEach((shape) => {
          shape.setAttribute("fill", "transparent");
          shape.style.pointerEvents = "auto";
          shape.style.cursor = "pointer";

          shape.addEventListener("mouseenter", (evt) => {
            //   console.log(evt);
            shape.dataset._origFill = shape.getAttribute("fill") ?? "";
            shape.dataset._origStroke = shape.getAttribute("stroke") ?? "";
            shape.setAttribute("fill", "rgba(0,0,0,0.15)");
          });

          shape.addEventListener("mouseleave", () => {
            shape.setAttribute("fill", "transparent");
          });
        });

      svgElement.appendChild(svgGroup);
      svgContainer.appendChild(svgElement);

      return svgContainer;
    });

  return svgContainers;
}
