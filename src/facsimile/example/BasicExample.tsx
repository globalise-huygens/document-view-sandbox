import React, {useRef} from 'react';
import {ViewerCanvas, ViewerProvider,} from '@knaw-huc/osd-iiif-viewer';
import {ManifestLoader} from '../ManifestLoader';

import '../facsimile.css';

import {Toolbar} from "./Toolbar";
import {NavigationBar} from "./NavigationBar";

const manifestUrl = 'https://globalise-huygens.github.io/' +
  'document-view-sandbox/iiif/manifest.json';

export function BasicExample() {
  const fullscreenRef = useRef<HTMLDivElement>(null);

  return (
    <ViewerProvider>
      <ManifestLoader url={manifestUrl}>
        <div
          className="facsimile-view"
          ref={fullscreenRef}
          style={{position: 'relative', width: '100%', height: 'calc(100vh - 2em)'}}
        >
          <ViewerCanvas showControls={false}/>
          <Toolbar fullscreenRef={fullscreenRef}/>
          <NavigationBar/>
        </div>
      </ManifestLoader>
    </ViewerProvider>
  );
}


