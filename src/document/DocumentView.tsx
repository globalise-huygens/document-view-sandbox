import React, {useState} from 'react';
import {FacsimileView} from '@globalise/facsimile';
import {Id} from '@globalise/common/annotation';
import {DocumentMode, DocumentModeControls} from './DocumentModeControls';
import {SplitPaneLayout} from './layout/SplitPaneLayout';
import {TranscriptionView} from './TranscriptionView';
import {SinglePaneLayout} from './layout/SinglePaneLayout';
import {useCanvasPages} from './useCanvasPages';

import './DocumentView.css';
import {HeaderCanvasControls} from "./HeaderCanvasControls";
import {MinimapView} from "./MinimapView";
import {useSettings} from "./SettingsStore";

type DocumentViewProps = {
  manifestUrl: string;
  canvasId?: string;
  onPageChange: (id: Id) => void;
};

export function DocumentView(
  {canvasId, onPageChange}: DocumentViewProps
) {
  const {documentMode: mode} = useSettings()
  const isPageInit = useCanvasPages(canvasId, onPageChange);

  if (!isPageInit) {
    return <div>Loading...</div>;
  }

  return (
    <div className="document-view" style={{height: '100%'}}>
      <HeaderCanvasControls />
      <DocumentModeControls />
      {mode === 'split' && (
        <SplitPaneLayout>
          <FacsimileView showNavigation={false} style={{height: '100%'}} />
          <TranscriptionView />
        </SplitPaneLayout>
      )}
      {mode === 'facsimile' && (
        <SinglePaneLayout>
          <FacsimileView showNavigation={false} style={{height: '100%'}} />
        </SinglePaneLayout>
      )}
      {mode === 'transcription' && (
        <SinglePaneLayout>
          <TranscriptionView />
        </SinglePaneLayout>
      )}
      {mode === 'minimap' && (
        <SinglePaneLayout>
          <MinimapView />
        </SinglePaneLayout>
      )}
    </div>
  );
}

