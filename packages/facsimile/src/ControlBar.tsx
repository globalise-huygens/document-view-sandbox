import {useViewerControls} from "@knaw-huc/osd-iiif-viewer";
import {type RefObject} from "react";

type ToolbarProps = {fullscreenRef: RefObject<HTMLDivElement | null>};

/**
 * WIP.
 * TODO: Use icons and theme
 */
export function ControlBar({fullscreenRef}: ToolbarProps) {
  const {
    zoomIn,
    zoomOut,
    rotateRight,
    toggleFullPage,
    isFullPage,
  } = useViewerControls(fullscreenRef);

  return (
    <div className="controls">
      <button onClick={zoomIn}>zoom in</button>
      <button onClick={zoomOut}>zoom out</button>
      <button onClick={rotateRight}>rotate</button>
      <button onClick={toggleFullPage}>
        {isFullPage ? 'exit fullscreen' : 'fullscreen'}
      </button>
    </div>
  );
}