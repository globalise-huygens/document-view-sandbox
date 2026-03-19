import React, {useRef} from 'react';
import {Viewer} from '@knaw-huc/osd-iiif-viewer';
import {HeaderRegion, useControlsMode} from '@globalise/common/header';
import {ControlBar} from './ControlBar';
import {FacsimileControls} from './FacsimileControls.tsx';
import {NavigationBar} from './NavigationBar';
import {HighlightOverlay} from './HighlightOverlay';

import './FacsimileView.css';

export type FacsimileViewerProps = {
  style?: React.CSSProperties;
};

export function FacsimileView({style}: FacsimileViewerProps) {
  const fullscreenRef = useRef<HTMLDivElement>(null);
  const controlsMode = useControlsMode();
  const controls = <FacsimileControls fullscreenRef={fullscreenRef}/>;
  return (
    <div
      className="facsimile-view"
      ref={fullscreenRef}
      style={{position: 'relative', width: '100%', height: '100%', ...style}}
    >
      <Viewer showControls={false}/>
      <HighlightOverlay/>
      {controlsMode === 'header'
        ? <HeaderRegion region="left">{controls}</HeaderRegion>
        : <ControlBar>{controls}</ControlBar>
      }
      <NavigationBar/>
    </div>
  );
}