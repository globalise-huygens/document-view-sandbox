import {useViewerControls} from "@knaw-huc/osd-iiif-viewer";
import React, {type RefObject} from "react";

type ToolbarProps = {fullscreenRef: RefObject<HTMLDivElement | null>};

export function ControlBar({fullscreenRef}: ToolbarProps) {
  const {
    zoomIn,
    zoomOut,
    toggleFullPage,
    isFullPage,
  } = useViewerControls(fullscreenRef);

  return (
    <div className="controls">
      <button onClick={zoomIn}>zoom in</button>
      <button onClick={zoomOut}>zoom out</button>
      <button onClick={toggleFullPage}>
        {isFullPage ? 'exit fullscreen' : 'fullscreen'}
      </button>
    </div>
  );
}