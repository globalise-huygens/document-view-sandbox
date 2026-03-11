import {Overlay, useImageInfo,} from '@knaw-huc/osd-iiif-viewer';
import React, {useMemo, useState} from 'react';
import {
  findSvgPath,
  findTextualBodyValue,
  Id,
  isWord,
  parseSvgPath, useAnnotations,
} from '@globalise/annotation';
import {Tooltip, TooltipProps} from './Tooltip';

type HighlightOverlayProps = {
  selected: Id[];
  onToggle: (id: Id) => void;
  onHover?: (id: Id | null) => void;
};

export function HighlightOverlay(
  {selected, onToggle, onHover}: HighlightOverlayProps
) {
  const imageInfo = useImageInfo();
  const annotations = useAnnotations();
  const [tooltip, setTooltip] = useState<TooltipProps | null>(null);

  const fragments = useMemo(() => {
    if (!annotations) {
      return [];
    }
    return Object.values(annotations)
      .filter(isWord)
      .map(a => ({
        id: a.id,
        path: parseSvgPath(findSvgPath(a)),
        text: findTextualBodyValue(a),
      }));
  }, [annotations]);

  if (!imageInfo) {
    return null;
  }

  return (
    <>
      <Overlay location={imageInfo.location}>
        <svg
          viewBox={`0 0 ${imageInfo.size.x} ${imageInfo.size.y}`}
          style={{width: '100%', height: '100%', pointerEvents: 'none'}}
        >
          {fragments.map((fragment) => (
            <Highlight
              key={fragment.id}
              points={fragment.path}
              selected={selected.includes(fragment.id)}
              onClick={() => onToggle(fragment.id)}
              onHover={(hovering, e) => {
                onHover?.(hovering ? fragment.id : null);
                if (!hovering) {
                  setTooltip(null);
                  return;
                }
                setTooltip({text: fragment.text, x: e.clientX, y: e.clientY});
              }}
            />
          ))}
        </svg>
      </Overlay>
      {tooltip && <Tooltip x={tooltip.x} y={tooltip.y} text={tooltip.text}/>}
    </>
  );
}

type HighlightProps = {
  points: string;
  selected: boolean;
  onClick: () => void;
  onHover: (hovering: boolean, event: React.MouseEvent) => void;
};

function Highlight({points, selected, onClick, onHover}: HighlightProps) {
  const [hovered, setHovered] = useState(false);

  const fill = selected ? 'rgba(0,255,0,0.35)'
    : hovered ? 'rgba(0, 0, 0, 0.1)'
      : 'transparent';

  return (
    <polygon
      points={points}
      fill={fill}
      style={{pointerEvents: 'auto', cursor: 'pointer'}}
      onPointerDown={(e) => {
        e.stopPropagation();
        onClick();
      }}
      onMouseEnter={(e) => {
        setHovered(true);
        onHover(true, e);
      }}
      onMouseMove={(e) => onHover(true, e)}
      onMouseLeave={(e) => {
        setHovered(false);
        onHover(false, e);
      }}
    />
  );
}
