import React, {useEffect, useState} from 'react';
import {useManifest, ViewerProvider} from '@knaw-huc/osd-iiif-viewer';
import {SplitPaneView} from '../SplitPaneView';
import {Id} from '@globalise/common/annotation';
import {useDocumentStore, usePages} from '@globalise/common/document';
import {ManifestLoader} from '@globalise/facsimile';
import {HeaderProvider} from '@globalise/common/header';
import {ManifestDropdown, useCollectionManifests} from './ManifestDropdown';
import {StateDebug} from "./StateDebug";

const defaultManifest = 'https://globalise-huygens.github.io/' +
  'document-view-sandbox/iiif/manifest.json';

const collection = 'https://data.globalise.huygens.knaw.nl/' +
  'hdl:20.500.14722/inventory:collection';

export type ManifestEntry = {
  id: string;
  label: string;
};

const MANIFEST = 'manifest';
const CANVAS = 'canvas';

export function SplitPaneViewExample() {
  const params = new URLSearchParams(location.search);
  const canvasId = params.get(CANVAS) ?? undefined;

  const [manifestUrl, setManifestUrl] = useState(
    params.get(MANIFEST) ?? defaultManifest
  );
  const manifests = useCollectionManifests(collection);

  function handleManifestChange(url: string) {
    setManifestUrl(url);
    const newUrl = new URL(window.location.href);
    newUrl.searchParams.set(MANIFEST, url);
    newUrl.searchParams.delete(CANVAS);
    history.pushState({}, '', newUrl);
  }

  function handlePageChange(pageId: Id) {
    const url = new URL(window.location.href);
    url.searchParams.set(CANVAS, pageId);
    history.pushState({}, '', url);
  }

  return (
    <HeaderProvider>
      <ViewerProvider>
        <ManifestLoader url={manifestUrl}>
          <StateDebug />
          <ManifestDropdown
            manifests={manifests}
            selected={manifestUrl}
            onChange={handleManifestChange}
          />
          <SplitPaneView
            manifestUrl={manifestUrl}
            canvasId={canvasId}
            onPageChange={handlePageChange}
          />
        </ManifestLoader>
      </ViewerProvider>
    </HeaderProvider>
  );
}