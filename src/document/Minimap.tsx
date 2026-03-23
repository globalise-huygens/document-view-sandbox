import React, {useState, useEffect, RefObject} from 'react';
import {Rnd} from 'react-rnd';
import {Viewer} from '@knaw-huc/osd-iiif-viewer';

const osdOptions = {
  showNavigationControl: false,
  mouseNavEnabled: false,
  gestureSettingsMouse: {clickToZoom: false, dblClickToZoom: false},
  gestureSettingsTouch: {clickToZoom: false, dblClickToZoom: false},
};

const minimapWidth = 200;
const minimapHeight = 250;
const margin = 20;

type MinimapProps = {
  parentRef: RefObject<HTMLDivElement | null>;
};

export function Minimap({parentRef}: MinimapProps) {
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
      </div>
    </Rnd>
  );
}