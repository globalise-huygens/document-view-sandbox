import React from 'react';
import {ViewerProvider} from '@knaw-huc/osd-iiif-viewer';
import {DocumentView} from '../DocumentView';
import {Id} from '@globalise/common/annotation';
import {ManifestLoader} from '@globalise/facsimile';
import {HeaderProvider} from '@globalise/common/HeaderContext';

const defaultManifestUrl = 'https://globalise-huygens.github.io/' +
  'document-view-sandbox/iiif/manifest.json';

export function DocumentViewExample() {
  const params = new URLSearchParams(location.search);
  const pageId = params.get('page') ?? undefined;
  const controlsMode = params.get('controls') === 'inline'
    ? 'inline'
    : 'header';

  function handlePageChange(pageId: Id) {
    const url = new URL(window.location.href);
    url.searchParams.set('page', pageId);
    history.pushState({}, '', url);
  }

  console.log('Init with:', {pageId, defaultManifestUrl})

  return (
    <HeaderProvider controlsMode={controlsMode}>
      <ViewerProvider>
        <ManifestLoader url={defaultManifestUrl}>
          <DocumentView
            manifestUrl={defaultManifestUrl}
            pageId={pageId}
            onPageChange={handlePageChange}
          />
        </ManifestLoader>
      </ViewerProvider>
    </HeaderProvider>
  );
}