import React, {useMemo} from 'react';
import {Rnd} from 'react-rnd';
import {Overlay, useImageInfo, Viewer} from '@knaw-huc/osd-iiif-viewer';
import {useAnnotations, usePartOf} from '@globalise/common/document';
import {
  findSvgPath,
  Id,
  isLine,
  parseSvgPath,
  PartOf
} from '@globalise/common/annotation';

const osdOptions = {
  showNavigationControl: false,
  homeFillsViewer: true,
};

type MinimapProps = {
  visibleLines: Set<Id>;
};

export function Minimap({visibleLines}: MinimapProps) {
  const minimapRatio = 0.2;
  const margin = 10;

  const pageSize = usePartOf();
  const {width, height} = calcMinimapSize(pageSize, minimapRatio, margin);

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      pointerEvents: 'none',
    }}>
      <Rnd
        default={{
          x: window.innerWidth - width - margin,
          y: window.innerHeight - height - margin,
          width,
          height,
        }}
        minWidth={100}
        minHeight={100}
        className="rnd"
        dragHandleClassName="handle"
      >
        <div className="viewport">
          <div
            className="handle"
          />
          <div style={{flex: 1, overflow: 'hidden'}}>
            <Viewer options={osdOptions}/>
            <MinimapHighlights lines={visibleLines}/>
          </div>
        </div>
      </Rnd>
    </div>
  );
}

function calcMinimapSize(
  pageSize: PartOf | null,
  minimapRatio: number,
  margin: number
) {
  const maxWidth = window.innerWidth - margin;
  const maxHeight = window.innerHeight - margin;
  const pageRatio = pageSize ? pageSize.height / pageSize.width : 1;
  const isLandscape = window.innerHeight < window.innerWidth;

  let width, height;
  if (isLandscape) {
    width = window.innerWidth * minimapRatio;
    height = width * pageRatio;
  } else {
    height = window.innerHeight * minimapRatio;
    width = height / pageRatio;
  }

  if (height > maxHeight) {
    height = maxHeight;
    width = height / pageRatio;
  }
  if (width > maxWidth) {
    width = maxWidth;
    height = width * pageRatio;
  }

  return {width, height};
}

function MinimapHighlights({lines}: { lines: Set<Id> }) {
  const viewImage = useImageInfo();
  const annotations = useAnnotations();

  const paths = useMemo(() => {
    if (!annotations) {
      return [];
    }
    return Object.values(annotations)
      .filter(isLine)
      .map(a => ({id: a.id, path: parseSvgPath(findSvgPath(a))}));
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