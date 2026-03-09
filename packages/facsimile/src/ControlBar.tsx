import {useViewerControls} from '@knaw-huc/osd-iiif-viewer';
import {type RefObject} from 'react';

import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import RotateRightIcon from '@mui/icons-material/RotateRight';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';

type ToolbarProps = {fullscreenRef: RefObject<HTMLDivElement | null>};

import './control-bar.css'

export function ControlBar({fullscreenRef}: ToolbarProps) {
  const {
    zoomIn,
    zoomOut,
    rotate,
    toggleFullPage,
    isFullPage,
  } = useViewerControls(fullscreenRef);

  return (
    <div className="control-bar">
      <button onClick={zoomIn}>
        <ZoomInIcon />
      </button>
      <button onClick={zoomOut}>
        <ZoomOutIcon />
      </button>
      <button onClick={() => rotate(90)}>
        <RotateRightIcon />
      </button>
      <button onClick={toggleFullPage}>
        {isFullPage ? <FullscreenExitIcon /> : <FullscreenIcon />}
      </button>
    </div>
  );
}