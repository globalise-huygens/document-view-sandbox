import {Overlay, useImageInfo} from '@knaw-huc/osd-iiif-viewer';
import React, {useMemo, useState} from 'react';
import {
  findSvgPath,
  findTextualBodyValue,
  Id,
  isBlock,
  isWord,
  parseSvgPath,
  useAnnotations,
} from '@globalise/common/annotation';
import {Tooltip, TooltipProps} from './Tooltip';

type HighlightOverlayProps = {
  selected: Id[];
  onToggle: (id: Id) => void;
  onHover?: (id: Id | null) => void;
};

export function HighlightOverlay(
  {selected, onToggle, onHover = () => {}}: HighlightOverlayProps
) {
  const imageInfo = useImageInfo();
  const annotations = useAnnotations();
  const [tooltip, setTooltip] = useState<TooltipProps | null>(null);

  const words = useMemo(() => {
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

  const blocks = useMemo(() => {
    if (!annotations) {
      return [];
    }
    return Object.values(annotations)
      .filter(isBlock)
      .map(a => ({
        id: a.id,
        path: parseSvgPath(findSvgPath(a)),
      }));
  }, [annotations]);

  const activeBlockIds = useMemo(() => {
    if (!annotations) {
      return [];
    }
    return selected.filter(id => annotations[id]?.textGranularity === 'block');
  }, [selected, annotations]);

  if (!imageInfo) {
    return null;
  }

  const highlightProps = {onToggle, onHover};

  return (
    <>
      <Overlay location={imageInfo.location}>
        <svg
          viewBox={`0 0 ${imageInfo.size.x} ${imageInfo.size.y}`}
          style={{width: '100%', height: '100%', pointerEvents: 'none'}}
        >
          {blocks.map(({id, path}) => (
            <BlockHighlight
              key={id}
              id={id}
              points={path}
              selected={activeBlockIds.includes(id)}
              {...highlightProps}
            />
          ))}
          {words.map(({id, path, text}) => (
            <WordHighlight
              key={id}
              id={id}
              points={path}
              text={text}
              selected={selected.includes(id)}
              setTooltip={setTooltip}
              {...highlightProps}
            />
          ))}
        </svg>
      </Overlay>
      {tooltip && <Tooltip x={tooltip.x} y={tooltip.y} text={tooltip.text}/>}
    </>
  );
}

type HighlightStyle = {
  fill: string;
  stroke?: string;
  strokeWidth?: number;
};

type HighlightProps = {
  points: string;
  highlightStyle: HighlightStyle;
  onClick: () => void;
  onHover: (hovering: boolean, event: React.MouseEvent) => void;
};

function Highlight({points, highlightStyle, onClick, onHover}: HighlightProps) {
  const {fill, stroke, strokeWidth} = highlightStyle;

  return (
    <polygon
      points={points}
      fill={fill}
      stroke={stroke ?? 'none'}
      strokeWidth={strokeWidth ?? 0}
      style={{pointerEvents: 'auto', cursor: 'pointer'}}
      onPointerDown={(e) => {
        e.stopPropagation();
        onClick();
      }}
      onMouseEnter={(e) => onHover(true, e)}
      onMouseMove={(e) => onHover(true, e)}
      onMouseLeave={(e) => onHover(false, e)}
    />
  );
}

type BlockHighlightProps = {
  id: Id;
  points: string;
  selected: boolean;
  onToggle: (id: Id) => void;
  onHover: (id: Id | null) => void;
};

type WordHighlightProps = BlockHighlightProps & {
  text: string;
  setTooltip: (tooltip: TooltipProps | null) => void;
};

function WordHighlight(
  {id, points, text, selected, onToggle, onHover, setTooltip}: WordHighlightProps
) {
  const [hovered, setHovered] = useState(false);

  const highlightStyle: HighlightStyle = {
    fill: selected ? 'rgba(0,255,0,0.35)'
      : hovered ? 'rgba(0,0,0,0.1)'
        : 'transparent',
  };

  return (
    <Highlight
      points={points}
      highlightStyle={highlightStyle}
      onClick={() => onToggle(id)}
      onHover={(hovering, e) => {
        setHovered(hovering);
        onHover(hovering ? id : null);
        if (!hovering) {
          setTooltip(null);
        } else {
          setTooltip({text, x: e.clientX, y: e.clientY});
        }
      }}
    />
  );
}

function BlockHighlight(
  {id, points, selected, onToggle, onHover}: BlockHighlightProps
) {
  const [hovered, setHovered] = useState(false);

  const highlightStyle: HighlightStyle = {
    fill: 'transparent',
    stroke: selected ? 'rgba(0,255,0,1)'
      : hovered ? 'rgba(0,0,0,0.3)'
        : 'transparent',
    strokeWidth: 5,
  };

  return (
    <Highlight
      points={points}
      highlightStyle={highlightStyle}
      onClick={() => onToggle(id)}
      onHover={(hovering) => {
        setHovered(hovering);
        onHover(hovering ? id : null);
      }}
    />
  );
}