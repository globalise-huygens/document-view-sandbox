import {useCanvas, useViewerReady} from '@knaw-huc/osd-iiif-viewer';
import {getValue} from '@iiif/helpers/i18n';

export function useCanvasNavigation() {
  const ready = useViewerReady();
  const {currentIndex, current, total, next, prev, goTo} = useCanvas();

  const goToRandom = () => goTo(Math.floor(Math.random() * total));

  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < total - 1;
  const label = current ? getValue(current.label) : null;
  const position = `(${currentIndex + 1}/${total})`;

  return {
    ready,
    prev,
    next,
    goToRandom,
    label,
    position,
    hasPrev,
    hasNext,
  };
}