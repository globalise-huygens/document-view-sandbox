import {
  useCanvas,
  Overlay,
  useImageInfo, getAnnotationPageIds,
} from '@knaw-huc/osd-iiif-viewer';
import React, {useEffect, useState} from 'react';
import {
  type AnnotationPage,
  type Annotation,
  findTextualBodyValue,
  findSvgPath,
  parseSvgPath, Id,
} from '@globalise/annotation';

type Fragment = {
  id: string;
  path: string;
  text: string;
};

type HighlightOverlayProps = {
  selected: Id[];
  onToggle: (id: Id) => void;
  onHover?: (id: Id | null) => void;
};

export function HighlightOverlay(
  {selected, onToggle, onHover}: HighlightOverlayProps
) {
  const {current} = useCanvas();
  const imageInfo = useImageInfo();
  const [fragments, setFragments] = useState<Fragment[]>([]);
  const [tooltip, setTooltip] = useState<TooltipProps | null>(null);

  useEffect(() => {
    if(!current) {
      return;
    }
    const url = getAnnotationPageIds(current)[0];
    if (!url) {
      setFragments([]);
      return;
    }
    fetch(url)
      .then((r) => r.json())
      .then((page: AnnotationPage) => {
        const lines = page.items.filter(isSupplementingLine);
        setFragments(lines.map((a) => {
          const path = parseSvgPath(findSvgPath(a));
          const text = findTextualBodyValue(a);
          return {id: a.id, path, text};
        }));
      });
  }, [current]);

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

export type TooltipProps = { text: string; x: number; y: number };

function Tooltip({x, y, text}: TooltipProps) {
  return (
    <div className="tooltip" style={{left: x + 10, top: y - 30}}>
      {text}
    </div>
  );
}

function isSupplementingLine(a: Annotation): boolean {
  return a.motivation === 'supplementing' &&
    a.textGranularity === 'word';
}