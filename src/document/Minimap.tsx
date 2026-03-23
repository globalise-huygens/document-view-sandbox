import React, {useState, useEffect, useMemo, RefObject} from 'react';
import {Rnd} from 'react-rnd';
import {Viewer, Overlay, useImageInfo} from '@knaw-huc/osd-iiif-viewer';
import {useAnnotations} from '@globalise/common/document';
import {Id, findSvgPath, isLine, parseSvgPath} from '@globalise/common/annotation';

const osdOptions = {
  showNavigationControl: false,
  mouseNavEnabled: false,
  gestureSettingsMouse: {clickToZoom: false, dblClickToZoom: false},
  gestureSettingsTouch: {clickToZoom: false, dblClickToZoom: false},
  homeFillsViewer: true,
};

const minimapWidth = 200;
const minimapHeight = 300;
const margin = 20;

type MinimapProps = {
  parentRef: RefObject<HTMLDivElement | null>;
  visibleLines: Set<Id>;
};

export function Minimap({parentRef, visibleLines}: MinimapProps) {
  const [position, setPosition] = useState<{x: number; y: number} | null>(null);

  useEffect(() => {
    const parent = parentRef.current;
    if (!parent) {
      return;
    }

    function update(parent: HTMLDivElement) {
      const rect = parent.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) {
        return;
      }
      setPosition({
        x: rect.width - minimapWidth - margin,
        y: rect.height - minimapHeight - margin,
      });
    }

    update(parent);

    const ro = new ResizeObserver(() => update(parent));
    ro.observe(parent);

    return () => ro.disconnect();
  }, [parentRef]);

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
        <MinimapHighlights visibleLines={visibleLines} />
      </div>
    </Rnd>
  );
}

function MinimapHighlights({visibleLines}: {visibleLines: Set<Id>}) {
  const viewImage = useImageInfo();
  const annotations = useAnnotations();

  const linePaths = useMemo(() => {
    if (!annotations) {
      return [];
    }
    return Object.values(annotations)
      .filter(isLine)
      .map(a => ({id: a.id, path: parseSvgPath(findSvgPath(a))}))
      .filter(p => !!p);
  }, [annotations]);

  if (!viewImage || !linePaths.length) {
    return null;
  }

  return (
    <Overlay location={viewImage.location}>
      <svg
        viewBox={`0 0 ${viewImage.size.x} ${viewImage.size.y}`}
        style={{width: '100%', height: '100%', pointerEvents: 'none'}}
      >
        {linePaths
          .filter(({id}) => visibleLines.has(id))
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