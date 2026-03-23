import React, {useRef} from 'react';
import {Viewer} from '@knaw-huc/osd-iiif-viewer';
import {ControlBar} from './ControlBar';
import {FacsimileControls} from './FacsimileControls.tsx';
import {CanvasControls} from './CanvasControls.tsx';
import {HighlightOverlay} from './HighlightOverlay';

import './FacsimileView.css';

export type FacsimileViewerProps = {
  style?: React.CSSProperties;
  showNavigation?: boolean;
};

export function FacsimileView(
  {style, showNavigation = true}: FacsimileViewerProps
) {
  const fullscreenRef = useRef<HTMLDivElement>(null);
  return (
    <div
      className="facsimile-view"
      ref={fullscreenRef}
      style={{position: 'relative', width: '100%', height: '100%', ...style}}
    >
      <Viewer options={{
        showNavigationControl: false,
        gestureSettingsMouse: {clickToZoom: false},
      }} />
      <HighlightOverlay/>
      <ControlBar>
        <FacsimileControls fullscreenRef={fullscreenRef}/>
      </ControlBar>
      {showNavigation && <CanvasControls/>}
    </div>
  );
}