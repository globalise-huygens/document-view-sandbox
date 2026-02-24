import React, {useState} from 'react';
import {createPortal} from 'react-dom';
import {ViewerProvider} from '@knaw-huc/osd-iiif-viewer';
import {FacsimileViewer} from '../FacsimileViewer';
import {MenuControls} from './MenuControls';
import {Id} from '@knaw-huc/original-layout';
import {$} from "../../diplomatic/example/$";

const manifestUrl = 'https://globalise-huygens.github.io/' +
  'document-view-sandbox/iiif/manifest.json';

export function BasicExample() {
  const [selectedIds, setSelectedIds] = useState<Id[]>([]);

  function toggleAnnotation(id: Id) {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  }

  return (
    <ViewerProvider>
      {createPortal(
        <MenuControls onToggleAnnotation={toggleAnnotation} />,
        $('#menu'),
      )}
      <FacsimileViewer
        manifestUrl={manifestUrl}
        selectedIds={selectedIds}
        onToggleAnnotation={toggleAnnotation}
        style={{height: 'calc(100vh - 2em)'}}
      />
    </ViewerProvider>
  );
}
