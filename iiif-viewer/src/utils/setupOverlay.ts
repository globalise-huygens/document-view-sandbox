import { useViewerStore } from "../stores/viewer-store";
import { createTranscriptionSvgs } from "./createTranscriptionSvgs";
import type { AnnotationPage } from "@iiif/presentation-3";

export function setupOverlay(annoPage: AnnotationPage | null) {
  const viewer = useViewerStore.getState().viewer;

  if (viewer) {
    viewer.addOnceHandler("open", () => {
      const item = viewer.world.getItemAt(0);
      const size = item.getContentSize();
      const imageRect = item.imageToViewportRectangle(0, 0, size.x, size.y);
      const svgContainers = createTranscriptionSvgs(annoPage, size);

      if (svgContainers) {
        svgContainers.forEach((container) => {
          if (container) {
            viewer.addOverlay({
              element: container,
              location: imageRect,
            });
          }
        });
      }
    });
  }
}
