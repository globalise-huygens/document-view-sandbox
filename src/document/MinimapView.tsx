import React, {useRef} from 'react';
import {useAnnotations, usePages} from '@globalise/common/document';
import {LineByLineView, useVisibleLines} from '@globalise/line-by-line';
import {Minimap} from './Minimap';

import './MinimapView.css';

export function MinimapView() {
  const annotations = useAnnotations();
  const {isReady, pages, error} = usePages();

  const textRef = useRef<HTMLDivElement>(null);
  const visibleLines = useVisibleLines(textRef);

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
    <div className="minimap-view">
      <div className="text" ref={textRef}>
        <LineByLineView annotations={annotations} />
      </div>
      <Minimap visibleLines={visibleLines} />
    </div>
  );
}