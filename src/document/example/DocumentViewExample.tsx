import React, {useState} from 'react';
import {createPortal} from 'react-dom';
import {ViewerProvider} from '@knaw-huc/osd-iiif-viewer';
import {DocumentView} from '../DocumentView';
import {Id} from '@globalise/common/annotation';
import {ManifestLoader} from '@globalise/facsimile';
import {HeaderProvider} from '@globalise/common/HeaderContext';
import {useHeaderRegion} from '@globalise/common/HeaderContext';
import {
  ManifestDropdown,
  useCollectionManifests
} from './ManifestDropdown';

const defaultManifestUrl = 'https://globalise-huygens.github.io/' +
  'document-view-sandbox/iiif/manifest.json';

const collectionUrl = 'https://data.globalise.huygens.knaw.nl/' +
  'hdl:20.500.14722/inventory:collection';

export type ManifestEntry = {
  id: string;
  label: string;
};

function ManifestPicker({manifests, selected, onChange}: {
  manifests: ManifestEntry[];
  selected: string;
  onChange: (url: string) => void;
}) {
  const center = useHeaderRegion('center');
  if (!center) {
    return null;
  }
  return createPortal(
    <ManifestDropdown
      manifests={manifests}
      selected={selected}
      onChange={onChange}
    />,
    center
  );
}

export function DocumentViewExample() {
  const params = new URLSearchParams(location.search);
  const pageId = params.get('page') ?? undefined;
  const controlsMode = params.get('controls') === 'inline'
    ? 'inline'
    : 'header';

  const [manifestUrl, setManifestUrl] = useState(defaultManifestUrl);
  const manifests = useCollectionManifests(collectionUrl);

  function handleManifestChange(url: string) {
    setManifestUrl(url);
    const newUrl = new URL(window.location.href);
    newUrl.searchParams.delete('page');
    history.pushState({}, '', newUrl);
  }

  function handlePageChange(pageId: Id) {
    const url = new URL(window.location.href);
    url.searchParams.set('page', pageId);
    history.pushState({}, '', url);
  }

  return (
    <HeaderProvider controlsMode={controlsMode}>
      <ViewerProvider>
        <ManifestLoader url={manifestUrl}>
          <ManifestPicker
            manifests={manifests}
            selected={manifestUrl}
            onChange={handleManifestChange}
          />
          <DocumentView
            manifestUrl={manifestUrl}
            pageId={pageId}
            onPageChange={handlePageChange}
          />
        </ManifestLoader>
      </ViewerProvider>
    </HeaderProvider>
  );
}