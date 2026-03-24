import React, {useState, useEffect, useMemo, RefObject} from 'react';
import {Rnd} from 'react-rnd';
import {Viewer, Overlay, useImageInfo} from '@knaw-huc/osd-iiif-viewer';
import {useAnnotations} from '@globalise/common/document';
import {Id, findSvgPath, isLine, parseSvgPath} from '@globalise/common/annotation';

const osdOptions = {
  showNavigationControl: false,
  mouseNavEnabled: false,
  gestureSettingsMouse: {clickToZoom: false, dblClickToZoom: false},
  homeFillsViewer: true,
};

const minimapWidth = 300;
const minimapHeight = 200;
const margin = 10;

type MinimapProps = {
  visibleLines: Set<Id>;
};

export function Minimap({visibleLines}: MinimapProps) {
  const [position, setPosition] = useState<{x: number; y: number} | null>(null);

  useEffect(() => {
    function updatePosition() {
      setPosition({
        x: window.innerWidth - minimapWidth - margin,
        y: window.innerHeight - minimapHeight - margin,
      });
    }

    updatePosition();

    const resizeObserver = new ResizeObserver(updatePosition);
    resizeObserver.observe(document.body);

    return () => resizeObserver.disconnect();
  }, []);

  if (!position) {
    return null;
  }

  return (
    <Rnd
      default={{
        x: position.x,
        y: position.y,
        width: minimapWidth,
        height: minimapHeight,
      }}
      minWidth={100}
      minHeight={100}
      bounds="parent"
      className="rnd"
    >
      <div style={{width: '100%', height: '100%'}}>
        <Viewer options={osdOptions} />
        <MinimapHighlights lines={visibleLines} />
      </div>
    </Rnd>
  );
}

function MinimapHighlights({lines}: {lines: Set<Id>}) {
  const viewImage = useImageInfo();
  const annotations = useAnnotations();

  const paths = useMemo(() => {
    if (!annotations) {
      return [];
    }
    return Object.values(annotations)
      .filter(isLine)
      .map(a => ({id: a.id, path: parseSvgPath(findSvgPath(a))}))
  }, [annotations]);

  if (!viewImage || !paths.length) {
    return null;
  }

  return (
    <Overlay location={viewImage.location}>
      <svg
        viewBox={`0 0 ${viewImage.size.x} ${viewImage.size.y}`}
        style={{width: '100%', height: '100%', pointerEvents: 'none'}}
      >
        {paths
          .filter(({id}) => lines.has(id))
          .map(({id, path}) => (
            <polygon
              key={id}
              points={path}
              fill="rgba(0,255,0,0.25)"
            />
          ))}
      </svg>
    </Overlay>
  );
}