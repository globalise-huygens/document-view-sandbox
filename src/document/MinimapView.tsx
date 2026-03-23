import React, {useRef} from 'react';
import {useAnnotations, usePages} from '@globalise/common/document';
import {LineByLineView} from '@globalise/line-by-line';
import {Minimap} from './Minimap';

import './MinimapView.css';

export function MinimapView() {
  const ref = useRef<HTMLDivElement>(null);
  const annotations = useAnnotations();
  const {isReady, pages, error} = usePages();

  if (error) {
    return <div className="message error">Error: {error}</div>;
  }
  if (!isReady) {
    return <div className="message">Loading...</div>;
  }
  if (!pages.length) {
    return <div className="message">No transcription</div>;
  }
  if (!annotations) {
    return <div className="message">Loading...</div>;
  }

  return (
    <div className="minimap-view" ref={ref}>
      <div className="text">
        <LineByLineView annotations={annotations} />
      </div>
      <Minimap parentRef={ref} />
    </div>
  );
}