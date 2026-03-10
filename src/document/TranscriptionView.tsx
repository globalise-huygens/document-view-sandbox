import React, {useEffect, useRef, useState} from 'react';
import {getAnnotationPageIds, useCanvas} from '@knaw-huc/osd-iiif-viewer';
import {Annotation, AnnotationPage, Id, PartOf} from '@globalise/annotation';
import {DiplomaticView} from '@globalise/diplomatic';
import {LineByLineLayout} from '@globalise/line-by-line';
import {LoadingStatus} from './LoadingStatus';
import {Benchmark} from '../util/Benchmark';
import {CanvasNormalized} from '@iiif/presentation-3-normalized';
import {Size} from "./Size";
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';

import '@globalise/facsimile/control-bar.css';

const bench = new Benchmark('loadAnnotations');

type TranscriptionViewProps = {
  selected: Id[];
  onHover: (id: Id | null) => void;
  onClick: (id: Id) => void;
};

export function TranscriptionView(
  {selected, onHover, onClick}: TranscriptionViewProps
) {
  const {current} = useCanvas();
  const [showDiplomatic, setShowDiplomatic] = useState(true);
  const [annotations, setAnnotations] = useState<Record<Id, Annotation> | null>(null);
  const [page, setPage] = useState<PartOf | null>(null);
  const [status, setStatus] = useState<LoadingStatus>('loading');
  const [scale, setScale] = useState(100);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({width: 0, height: 0});

  const emptyPageThreshold = 10;
  const [showScanMargin, setShowScanMargin] = useState<boolean>();

  useEffect(() => {
    const scrollSlider = scrollRef.current;
    if (!scrollSlider) {
      return;
    }
    const observer = new ResizeObserver(([entry]) => {
      setContainerSize({
        width: entry.contentRect.width,
        height: entry.contentRect.height
      });
    });
    observer.observe(scrollSlider);
    return () => observer.disconnect();
  }, [status]);

  useEffect(() => {
    if (!current) {
      return;
    }

    bench.run(async () => await loadAnnotations(current));

    async function loadAnnotations(
      current: CanvasNormalized
    ) {
      if (!current) {
        return;
      }
      const pageIds = getAnnotationPageIds(current);

      const transcriptionUrl = pageIds[0];
      const entityUrl = pageIds[1];

      if (!transcriptionUrl) {
        setStatus('no-transcription');
        return;
      }

      const transcriptionPage: AnnotationPage = await fetch(transcriptionUrl)
        .then(r => r.json());

      const mapped: Record<Id, Annotation> = {};
      for (const item of transcriptionPage.items) {
        mapped[item.id] = item;
      }
      if (entityUrl) {
        const entityPage: AnnotationPage = await fetch(entityUrl)
          .then(r => r.json());
        for (const item of entityPage.items) {
          mapped[item.id] = item;
        }
      }
      setAnnotations(mapped);
      const words = transcriptionPage.items.filter(a => a.textGranularity === 'word');
      setShowScanMargin(words.length < emptyPageThreshold);
      setPage(transcriptionPage.partOf);
      setStatus('ready');
    }

  }, [current]);

  if (status === 'loading' || !annotations || !page) {
    return <div className="message">Loading...</div>;
  }

  if (status === 'no-transcription') {
    return <div className="message">No transcription</div>;
  }

  const scaleFactor = scale / 100;
  const size = calcSize(page, containerSize, scaleFactor);
  const hasSize = containerSize.width > 0 && containerSize.height > 0;

  const rerenderKey = `${scale}-${containerSize.width}-${containerSize.height}`;

  return (
    <div className="transcription-view">
      <div className="control-bar">
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
      </div>
      <div className="content">
        <div className="zoom-viewport" ref={scrollRef}>
          {hasSize && (
            <div style={size}>
              <DiplomaticView
                key={rerenderKey}
                visible={showDiplomatic}
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
        <LineByLineLayout
          visible={!showDiplomatic}
          annotations={annotations}
          selected={selected}
          onHover={onHover}
          onClick={onClick}
        />
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
