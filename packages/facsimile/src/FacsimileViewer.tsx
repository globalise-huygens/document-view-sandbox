import React, {useRef} from 'react';
import {Viewer} from '@knaw-huc/osd-iiif-viewer';
import {ControlBar} from './ControlBar';
import {NavigationBar} from './NavigationBar';
import {HighlightOverlay} from './HighlightOverlay';
import {Id} from '@globalise/annotation';

import './facsimile.css';
import './tooltip.css';

export type FacsimileViewerProps = {
  manifestUrl: string;
  selected: Id[];
  onToggle: (id: Id) => void;
  onHover?: (id: Id | null) => void;
  style?: React.CSSProperties;
};

export function FacsimileViewer(
  {
    selected,
    onToggle,
    onHover,
    style
  }: FacsimileViewerProps
) {
  const fullscreenRef = useRef<HTMLDivElement>(null);

  return (
    <div
      className="facsimile-view"
      ref={fullscreenRef}
      style={{position: 'relative', width: '100%', height: '100%', ...style}}
    >
      <Viewer showControls={false}/>
      <HighlightOverlay
        selected={selected}
        onToggle={onToggle}
        onHover={onHover}
      />
      <ControlBar fullscreenRef={fullscreenRef}/>
      <NavigationBar/>
    </div>
  );
}