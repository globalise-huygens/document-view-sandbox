import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {useCanvas, useLoadManifest, useManifest} from '@knaw-huc/osd-iiif-viewer';
import {FacsimileViewer} from '@globalise/facsimile';
import {Id} from '@globalise/annotation';
import {TranscriptionView} from './TranscriptionView';
import {DocumentLayout} from "./layout/DocumentLayout";

type DocumentViewProps = {
  manifestUrl: string;
  pageId?: string;
  onPageChange: (id: Id) => void
};

export function DocumentView(
  {manifestUrl, pageId, onPageChange}: DocumentViewProps
) {
  const loadManifest = useLoadManifest();
  const {current, goTo} = useCanvas();
  const [isInit, setInit] = useState(false);
  const [clickedIds, setClickedIds] = useState<Id[]>([]);
  const [hoveredId, setHoveredId] = useState<Id | null>(null);
  const { vault, url, isReady } = useManifest();

  useEffect(() => {
    loadManifest(manifestUrl);
  }, [manifestUrl, loadManifest]);

  useEffect(() => {
    if (!isReady) {
      return;
    }
    const manifest = vault.get({ id: url, type: 'Manifest' });
    const canvases = vault.get(manifest.items);
    if (pageId) {
      const index = canvases.findIndex(c => c.id === pageId);
      if (index >= 0) {
        goTo(index);
      }
    } else if (canvases.length > 0) {
      goTo(0);
    }
    setInit(true);
  }, [isReady, url, vault, pageId, isInit, goTo]);

  useEffect(() => {
    if (!current) {
      return;
    }
    setClickedIds([]);
    setHoveredId(null);
    onPageChange(current.id);
  }, [current]);

  const toggleClickedIds = useCallback((id: Id) => {
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
    <DocumentLayout>
      <FacsimileViewer
        manifestUrl={manifestUrl}
        selected={selectedIds}
        onToggle={toggleClickedIds}
        onHover={setHoveredId}
        style={{height: '100%'}}
      />
      <TranscriptionView
        selected={selectedIds}
        onHover={setHoveredId}
        onClick={toggleClickedIds}
      />
    </DocumentLayout>
  );
}