import React, {useRef} from 'react';
import {ViewerCanvas} from '@knaw-huc/osd-iiif-viewer';
import {ManifestLoader} from './ManifestLoader';
import {ControlBar} from './ControlBar';
import {NavigationBar} from './NavigationBar';
import {HighlightOverlay} from './HighlightOverlay';
import {Id} from '@globalise/annotation';

import './facsimile.css';
import './tooltip.css';

export type FacsimileViewerProps = {
  manifestUrl: string;
  selectedIds: Id[];
  onToggle: (id: Id) => void;
  onHover?: (id: Id | null) => void;
  style?: React.CSSProperties;
};

export function FacsimileViewer(
  {
    manifestUrl,
    selectedIds,
    onToggle,
    onHover,
    style
  }: FacsimileViewerProps
) {
  const fullscreenRef = useRef<HTMLDivElement>(null);

  return (
    <ManifestLoader url={manifestUrl}>
      <div
        className="facsimile-view"
        ref={fullscreenRef}
        style={{position: 'relative', width: '100%', height: '100%', ...style}}
      >
        <ViewerCanvas showControls={false}/>
        <HighlightOverlay
          selected={selectedIds}
          onToggle={onToggle}
          onHover={onHover}
        />
        <ControlBar fullscreenRef={fullscreenRef}/>
        <NavigationBar/>
      </div>
    </ManifestLoader>
  );
}