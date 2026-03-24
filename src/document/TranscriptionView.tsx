import React, {useEffect, useMemo, useRef, useState} from 'react';
import {
  Id,
  useAnnotations,
  usePages,
  usePartOf,
  useTextGranularity,
  useEntityOverlap,
} from '@globalise/common/annotation';
import {useDocumentStore} from '@globalise/common/DocumentStore';
import {DiplomaticView} from '@globalise/diplomatic';
import {LineByLineView} from '@globalise/line-by-line';
import {Size} from './Size';
import {ViewFit} from '@knaw-huc/original-layout';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import {ControlBar} from '@globalise/facsimile';
import {
  useSettings,
  setDiplomaticViewScale, setViewMode
} from './SettingsStore';
import {useLayoutDirection} from './layout/useLayoutDirection';
import {layoutBreakpoint} from './layout/DocumentLayout';

import './TranscriptionView.css';

const emptyPageThreshold = 10;

export function TranscriptionView() {
  const annotations = useAnnotations();
  const page = usePartOf();
  const {isReady, pages, error} = usePages();
  const {viewMode, diplomaticViewScale} = useSettings();
  const scale = diplomaticViewScale;
  const showDiplomatic = viewMode === 'diplomatic'
  const viewportRef = useRef<HTMLDivElement>(null);
  const [viewportSize, setViewportSize] = useState({width: 0, height: 0});
  const direction = useLayoutDirection(layoutBreakpoint);
  const fit: ViewFit = direction === 'vertical' ? 'width' : 'contain';

  const {hoveredId, clickedId} = useDocumentStore();
  const {wordToBlock} = useTextGranularity();
  const {entityToBlock} = useEntityOverlap();

  /**
   * Select:
   * - entity --> entity + block
   * - word --> word + block
   */
  const selectedIds = useMemo(() => {
    const selectedIds = new Set<Id>();
    if (hoveredId) {
      select(hoveredId);
    }
    if (clickedId) {
      select(clickedId);
    }
    return [...selectedIds];

    function select(id: Id) {
      selectedIds.add(id);
      const blockFromWord = wordToBlock[id];
      if (blockFromWord) {
        selectedIds.add(blockFromWord);
      }
      const blockFromEntity = entityToBlock[id];
      if (blockFromEntity) {
        selectedIds.add(blockFromEntity);
      }
    }
  }, [hoveredId, clickedId, wordToBlock, entityToBlock]);

  const showScanMargin = useMemo(() => {
    if (!annotations) {
      return false;
    }
    const words = Object.values(annotations)
      .filter(a => a.textGranularity === 'word');
    return words.length < emptyPageThreshold;
  }, [annotations]);

  useEffect(trackViewportSize, [isReady]);
  function trackViewportSize() {
    if (!isReady) {
      return;
    }
    const viewport = viewportRef.current;
    if (!viewport) {
      return;
    }
    const observer = new ResizeObserver(([change]) => {
      const {width, height} = change.contentRect;
      setViewportSize({width, height});
    });
    observer.observe(viewport);
    return () => observer.disconnect();
  }

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
  const ratioBoxSize = calcRatioBox(page, viewportSize, scaleFactor, fit);
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
              onClick={() => setDiplomaticViewScale(Math.max(30, scale - 10))}
            />
            <input
              type="range"
              min={30}
              max={200}
              value={scale}
              onChange={(e) => setDiplomaticViewScale(parseInt(e.target.value))}
            />
            <ZoomInIcon
              className="icon"
              fontSize="small"
              onClick={() => setDiplomaticViewScale(Math.min(200, scale + 10))}
            />
          </span>
        )}
        <button
          className={showDiplomatic ? 'active' : ''}
          onClick={() => setViewMode('diplomatic')}
        >
          Diplomatic
        </button>
        <button
          className={!showDiplomatic ? 'active' : ''}
          onClick={() => setViewMode('line-by-line')}
        >
          Line by line
        </button>
      </ControlBar>
      <div className="content">
        <div
          className={`viewport diplomatic-viewport ${showDiplomatic ? 'active' : ''}`}
          ref={viewportRef}
        >
          {hasSize && (
            <div className="ratio-box" style={ratioBoxSize}>
              <DiplomaticView
                key={rerenderKey}
                annotations={annotations}
                selected={selectedIds}
                page={page}
                showBlocks={true}
                showScanMargin={showScanMargin}
                fit={fit}
                style={{height: '100%'}}
              />
            </div>
          )}
        </div>
        <div
          className={`viewport line-by-line-viewport ${!showDiplomatic ? 'active' : ''}`}
        >
          <LineByLineView
            annotations={annotations}
            selected={selectedIds}
          />
        </div>
      </div>
    </div>
  );
}

function calcRatioBox(
  page: Size,
  viewport: Size,
  scaleFactor: number,
  fit: ViewFit
): Size {
  const pageRatio = page.width / page.height;
  let width: number;
  let height: number;

  if (fit === 'width') {
    width = viewport.width;
    height = width / pageRatio;
  } else if (fit === 'height') {
    height = viewport.height;
    width = height * pageRatio;
  } else {
    const containerRatio = viewport.width / viewport.height;
    if (pageRatio > containerRatio) {
      width = viewport.width;
      height = width / pageRatio;
    } else {
      height = viewport.height;
      width = height * pageRatio;
    }
  }

  return {
    width: width * scaleFactor,
    height: height * scaleFactor
  };
}
