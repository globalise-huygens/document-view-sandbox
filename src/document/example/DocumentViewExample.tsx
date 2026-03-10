import React from 'react';
import {ViewerProvider} from '@knaw-huc/osd-iiif-viewer';
import {DocumentView} from '../DocumentView';
import {Id} from "@globalise/annotation";

import '@knaw-huc/original-layout/style.css';
import '@globalise/line-by-line/style.css';
import '../document-view.css';
import '../../diplomatic/highlight.css';
import {ManifestLoader} from "@globalise/facsimile";

const defaultManifestUrl = 'https://globalise-huygens.github.io/' +
  'document-view-sandbox/iiif/manifest.json';

export function DocumentViewExample() {
  const pageId = new URLSearchParams(location.search)
    .get('page') ?? undefined;

  function handlePageChange(pageId: Id) {
    const url = new URL(window.location.href);
    url.searchParams.set('page', pageId);
    history.pushState({}, '', url);
  }
  console.log('Init with:', {pageId, defaultManifestUrl})
  return (
    <ViewerProvider>
      <ManifestLoader url={defaultManifestUrl}>
        <DocumentView
          manifestUrl={defaultManifestUrl}
          pageId={pageId}
          onPageChange={handlePageChange}
        />
      </ManifestLoader>
    </ViewerProvider>
  );
}