import React, {useEffect, useMemo, useRef, useState} from 'react';
import {Id, useAnnotations, usePages, usePartOf} from '@globalise/annotation';
import {DiplomaticView} from '@globalise/diplomatic';
import {LineByLineLayout} from '@globalise/line-by-line';
import {Size} from './Size';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import {ControlBar} from '@globalise/facsimile';

import './TranscriptionView.css'

type TranscriptionViewProps = {
  selected: Id[];
  onHover: (id: Id | null) => void;
  onClick: (id: Id) => void;
};

const emptyPageThreshold = 10;

export function TranscriptionView(
  {selected, onHover, onClick}: TranscriptionViewProps
) {
  const annotations = useAnnotations();
  const page = usePartOf();
  const {isReady, pages, error} = usePages();
  const [showDiplomatic, setShowDiplomatic] = useState(true);
  const [scale, setScale] = useState(100);
  const viewportRef = useRef<HTMLDivElement>(null);
  const [viewportSize, setViewportSize] = useState({width: 0, height: 0});

  const showScanMargin = useMemo(() => {
    if (!annotations) {
      return false;
    }
    const words = Object.values(annotations)
      .filter(a => a.textGranularity === 'word');
    return words.length < emptyPageThreshold;
  }, [annotations]);

  useEffect(() => {
    if (!isReady || viewportSize.width > 0) {
      return;
    }
    const zoomViewport = viewportRef.current;
    if (!zoomViewport) {
      return;
    }
    const {width, height} = zoomViewport.getBoundingClientRect();
    setViewportSize({width, height});
  }, [isReady]);

  if (!isReady) {
    return <div className="message">Loading...</div>;
  }

  if (error) {
    return <div className="message">Error: {error}</div>;
  }

  if (!pages.length) {
    return <div className="message">No transcription</div>;
  }

  if (!annotations || !page) {
    return <div className="message">Loading...</div>;
  }

  const scaleFactor = scale / 100;
  const layoutSize = calcSize(page, viewportSize, scaleFactor);
  const hasSize = viewportSize.width > 0 && viewportSize.height > 0;

  const rerenderKey = `${scale}-${viewportSize.width}-${viewportSize.height}`;

  return (
    <div className="transcription-view">
      <ControlBar>
        {showDiplomatic && (
          <span className="zoom-slider">
            <ZoomOutIcon
              className="icon"
              fontSize="small"
              onClick={() => setScale(prev => Math.max(30, prev - 10))}
            />
            <input
              type="range"
              min={30}
              max={200}
              value={scale}
              onChange={(e) => setScale(parseInt(e.target.value))}
            />
            <ZoomInIcon
              className="icon"
              fontSize="small"
              onClick={() => setScale(prev => Math.min(200, prev + 10))}
            />
          </span>
        )}
        <button
          className={showDiplomatic ? 'active' : ''}
          onClick={() => setShowDiplomatic(true)}
        >
          Diplomatic
        </button>
        <button
          className={!showDiplomatic ? 'active' : ''}
          onClick={() => setShowDiplomatic(false)}
        >
          Line by line
        </button>
      </ControlBar>
      <div className="content">
        <div
          className={`diplomatic-viewport ${showDiplomatic ? 'active' : ''}`}
          ref={viewportRef}
        >
          {hasSize && (
            <div className="ratio-box" style={layoutSize}>
              <DiplomaticView
                key={rerenderKey}
                annotations={annotations}
                selected={selected}
                page={page}
                showEntities={true}
                showRegions={true}
                showScanMargin={showScanMargin}
                fit="contain"
                onHover={onHover}
                onClick={onClick}
                style={{height: '100%'}}
              />
            </div>
          )}
        </div>
        <div
          className={`line-by-line-viewport ${(!showDiplomatic ? 'active' : '')}`}
        >
          <LineByLineLayout
            annotations={annotations}
            selected={selected}
            onHover={onHover}
            onClick={onClick}
          />
        </div>
      </div>
    </div>
  );
}

function calcSize(
  page: Size,
  containerSize: Size,
  scaleFactor: number
): Size {
  const pageRatio = page.width / page.height;
  const containerRatio = containerSize.width / containerSize.height;

  let width: number;
  let height: number;
  if (pageRatio > containerRatio) {
    width = containerSize.width;
    height = width / pageRatio;
  } else {
    height = containerSize.height;
    width = height * pageRatio;
  }

  return {
    width: width * scaleFactor,
    height: height * scaleFactor
  };
}