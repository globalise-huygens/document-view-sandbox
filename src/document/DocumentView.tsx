import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {useCanvas, useManifest} from '@knaw-huc/osd-iiif-viewer';
import {FacsimileViewer} from '@globalise/facsimile';
import {
  Id,
  useLoadPages,
  useTextGranularity
} from '@globalise/common/annotation';
import {TranscriptionView} from './TranscriptionView';
import {DocumentLayout} from './layout/DocumentLayout';

import './DocumentView.css';

type DocumentViewProps = {
  manifestUrl: string;
  pageId?: string;
  onPageChange: (id: Id) => void
};

export function DocumentView(
  {manifestUrl, pageId, onPageChange}: DocumentViewProps
) {
  const {current, goTo} = useCanvas();
  const [isInit, setInit] = useState(false);
  const [clickedId, setClickedId] = useState<Id | null>(null);
  const [hoveredId, setHoveredId] = useState<Id | null>(null);
  const {vault, url, isReady} = useManifest();
  const loadPages = useLoadPages();
  const {wordToBlock} = useTextGranularity();

  useEffect(() => {
    if (!isReady) {
      return;
    }
    const manifest = vault.get({id: url, type: 'Manifest'});
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
    const urls = current.annotations
      .filter(a => a.type === 'AnnotationPage')
      .map(a => a.id);
    loadPages(current.id, urls);
    setClickedId(null);
    setHoveredId(null);
    onPageChange(current.id);
  }, [current]);

  const selectedIds = useMemo(() => {
    const result = new Set<Id>();
    if (hoveredId) {
      result.add(hoveredId);
      const blockId = wordToBlock[hoveredId];
      if (blockId) {
        result.add(blockId);
      }
    }
    if (clickedId) {
      result.add(clickedId)
    }
    return [...result];
  }, [clickedId, hoveredId, wordToBlock]);

  if (!isInit) {
    return <div>Loading...</div>;
  }

  function toggleClicked(id: Id) {
    if (!id) {
      setClickedId(null)
    } else if (id === clickedId) {
      setClickedId(null)
    } else {
      setClickedId(id)
    }
  }

  return (
    <DocumentLayout>
      <FacsimileViewer
        manifestUrl={manifestUrl}
        selected={selectedIds}
        onToggle={toggleClicked}
        onHover={setHoveredId}
        style={{height: '100%'}}
      />
      <TranscriptionView
        selected={selectedIds}
        onHover={setHoveredId}
        onClick={toggleClicked}
      />
    </DocumentLayout>
  );
}