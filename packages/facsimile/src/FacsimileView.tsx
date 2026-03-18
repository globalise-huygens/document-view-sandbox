import React, {useRef} from 'react';
import {Viewer} from '@knaw-huc/osd-iiif-viewer';
import {FacsimileControlBar} from './FacsimileControlBar';
import {NavigationBar} from './NavigationBar';
import {HighlightOverlay} from './HighlightOverlay';

import './FacsimileView.css';

export type FacsimileViewerProps = {
  style?: React.CSSProperties;
};

export function FacsimileView({style}: FacsimileViewerProps) {
  const fullscreenRef = useRef<HTMLDivElement>(null);
  return (
    <div
      className="facsimile-view"
      ref={fullscreenRef}
      style={{position: 'relative', width: '100%', height: '100%', ...style}}
    >
      <Viewer showControls={false}/>
      <HighlightOverlay/>
      <FacsimileControlBar fullscreenRef={fullscreenRef}/>
      <NavigationBar/>
    </div>
  );
}