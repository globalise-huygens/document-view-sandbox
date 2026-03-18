import React, {useRef} from 'react';
import {createPortal} from 'react-dom';
import {Viewer} from '@knaw-huc/osd-iiif-viewer';
import {useHeaderRegion} from '@globalise/common/HeaderContext';
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
  const headerRegion = useHeaderRegion('left');
  const controls = <FacsimileControls fullscreenRef={fullscreenRef}/>;
  return (
    <div
      className="facsimile-view"
      ref={fullscreenRef}
      style={{position: 'relative', width: '100%', height: '100%', ...style}}
    >
      <Viewer showControls={false}/>
      <HighlightOverlay/>
      {headerRegion
        ? createPortal(controls, headerRegion)
        : <ControlBar>{controls}</ControlBar>
      }
      <NavigationBar/>
    </div>
  );
}