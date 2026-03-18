import React, {useEffect, useState} from 'react';
import {useCanvas, useManifest} from '@knaw-huc/osd-iiif-viewer';
import {FacsimileView} from '@globalise/facsimile';
import {Id, useLoadPages} from '@globalise/common/annotation';
import {TranscriptionView} from './TranscriptionView';
import {DocumentLayout} from './layout/DocumentLayout';
import {clearSelection} from '@globalise/common/DocumentStore';

import './DocumentView.css';

type DocumentViewProps = {
  manifestUrl: string;
  pageId?: string;
  onPageChange: (id: Id) => void;
};

export function DocumentView(
  {pageId, onPageChange}: DocumentViewProps
) {
  const {current, goTo} = useCanvas();
  const [isInit, setInit] = useState(false);
  const {vault, url, isReady} = useManifest();
  const loadPages = useLoadPages();

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
    clearSelection();
    onPageChange(current.id);
  }, [current]);

  if (!isInit) {
    return <div>Loading...</div>;
  }

  return (
    <DocumentLayout>
      <FacsimileView style={{height: '100%'}}/>
      <TranscriptionView/>
    </DocumentLayout>
  );
}