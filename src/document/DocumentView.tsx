import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {useCanvas, useLoadManifest, useManifest} from '@knaw-huc/osd-iiif-viewer';
import {FacsimileViewer} from '@globalise/facsimile';
import {Id} from '@globalise/annotation';
import {TranscriptionView} from './TranscriptionView';

type DocumentViewProps = {
  manifestUrl: string;
  pageId?: string;
  onPageChange: (id: Id) => void
};

export function DocumentView(
  {manifestUrl, pageId, onPageChange}: DocumentViewProps
) {
  const loadManifest = useLoadManifest();
  const manifest = useManifest();
  const {current, goTo} = useCanvas();
  const [isInit, setInit] = useState(false);
  const [clickedIds, setClickedIds] = useState<Id[]>([]);
  const [hoveredId, setHoveredId] = useState<Id | null>(null);

  useEffect(() => {
    loadManifest(manifestUrl);
  }, [manifestUrl, loadManifest]);

  useEffect(() => {
    if (!manifest.data || isInit) {
      return;
    }
    const canvases = manifest.data.canvases;
    if (pageId) {
      const index = canvases.findIndex(c => c.id === pageId);
      if (index >= 0) {
        goTo(index);
      }
    } else if (canvases.length > 0) {
      goTo(0);
    }
    setInit(true);
  }, [manifest.data, pageId, isInit, goTo]);

  useEffect(() => {
    if(current) {
      onPageChange(current.id)
    }
  }, [current]);

  const handleToggle = useCallback((id: Id) => {
    setClickedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  }, []);

  const selectedIds = useMemo(() => {
    if (!hoveredId) {
      return clickedIds;
    }
    return [...new Set([...clickedIds, hoveredId])];
  }, [clickedIds, hoveredId]);

  if (!isInit) {
    return <div>Loading...</div>;
  }

  return (
    <div className="document-view">
      <div className="facsimile">
        <FacsimileViewer
          manifestUrl={manifestUrl}
          selected={selectedIds}
          onToggle={handleToggle}
          onHover={setHoveredId}
          style={{height: '100%'}}
        />
      </div>
      <div className="transcription">
        <TranscriptionView
          selected={selectedIds}
          onHover={setHoveredId}
        />
      </div>
    </div>
  );
}