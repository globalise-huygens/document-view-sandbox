import React from 'react';
import {Rnd} from 'react-rnd';
import {Viewer} from '@knaw-huc/osd-iiif-viewer';
import {usePartOf} from '@globalise/common/document';
import {PartOf} from '@globalise/common/annotation';
import {MinimapOverlay} from './MinimapOverlay';

const osdOptions = {
  showNavigationControl: false,
  homeFillsViewer: true,
};

export function Minimap() {
  const minimapScreenRatio = 0.2;
  const margin = 10;

  const pageSize = usePartOf();
  const {width, height} = calcMinimapSize(pageSize, minimapScreenRatio, margin);

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
          <div className="handle" />
          <div style={{flex: 1, overflow: 'hidden'}}>
            <Viewer options={osdOptions} />
            <MinimapOverlay />
          </div>
        </div>
      </Rnd>
    </div>
  );
}

function calcMinimapSize(
  pageSize: PartOf | null,
  minimapScreenRatio: number,
  margin: number
) {
  const maxWidth = window.innerWidth - margin;
  const maxHeight = window.innerHeight - margin;
  const pageRatio = pageSize ? pageSize.height / pageSize.width : 1;
  const isLandscape = window.innerHeight < window.innerWidth;

  let width, height;
  if (isLandscape) {
    width = window.innerWidth * minimapScreenRatio;
    height = width * pageRatio;
  } else {
    height = window.innerHeight * minimapScreenRatio;
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