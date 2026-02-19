import React from 'react';
import {ViewerCanvas, ViewerProvider} from '@knaw-huc/osd-iiif-viewer';
import {ManifestLoader} from "../ManifestLoader";

const manifestUrl = 'https://globalise-huygens.github.io/' +
  'document-view-sandbox/iiif/manifest.json';
const startCanvas = 314;

export function BasicExample() {
  return (
    <ViewerProvider>
      <ManifestLoader url={manifestUrl} canvas={startCanvas}>
        <div style={{width: '100%', height: 'calc(100vh - 2em)'}}>
          <ViewerCanvas/>
        </div>
      </ManifestLoader>
    </ViewerProvider>
  );
}

