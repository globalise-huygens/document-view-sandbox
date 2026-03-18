import {Overlay, useImageInfo} from '@knaw-huc/osd-iiif-viewer';
import React, {useMemo, useState} from 'react';
import {
  findSvgPath,
  findTextualBodyValue,
  Id,
  isBlock,
  isWord,
  useAnnotations,
  parseSvgPath,
  useTextGranularity,
  useEntityOverlap,
} from '@globalise/common/annotation';
import {useDocumentStore, setHovered, toggleClicked} from '@globalise/common/DocumentStore';
import {Tooltip, TooltipProps} from './Tooltip';
import {noop} from '@globalise/common';

export function HighlightOverlay() {
  const imageInfo = useImageInfo();
  const annotations = useAnnotations();
  const [tooltip, setTooltip] = useState<TooltipProps | null>(null);

  const {hoveredId, clickedId} = useDocumentStore();
  const {wordToBlock} = useTextGranularity();
  const {entityToWords, entityToBlock} = useEntityOverlap();

  /**
   * Select:
   * - entity --> words + block
   * - word --> word + block
   */
  const selectedIds = useMemo(() => {
    const selectedIds = new Set<Id>();
    if (hoveredId) {
      select(hoveredId);
    }
    if (clickedId) {
      select(clickedId);
    }
    return [...selectedIds];

    function select(id: Id) {
      selectedIds.add(id);
      const blockId = wordToBlock[id];
      if (blockId) {
        selectedIds.add(blockId);
      }
      const wordIds = entityToWords[id];
      if (wordIds) {
        wordIds.forEach(w => selectedIds.add(w));
        const blockFromEntity = entityToBlock[id];
        if (blockFromEntity) {
          selectedIds.add(blockFromEntity);
        }
      }
    }
  }, [hoveredId, clickedId, wordToBlock, entityToWords, entityToBlock]);

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

  const selectedBlockIds = useMemo(() => {
    if (!annotations) {
      return [];
    }
    return selectedIds.filter(id => annotations[id]?.textGranularity === 'block');
  }, [selectedIds, annotations]);

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
          {blocks.map(({id, path}) => (
            <BlockHighlight
              key={id}
              id={id}
              points={path}
              selected={selectedBlockIds.includes(id)}
            />
          ))}
          {words.map(({id, path, text}) => (
            <WordHighlight
              key={id}
              id={id}
              points={path}
              text={text}
              selected={selectedIds.includes(id)}
              setTooltip={setTooltip}
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
  cursor?: string;
};

type HighlightProps = {
  points: string;
  highlightStyle: HighlightStyle;
  onClick?: () => void;
  onHover: (hovering: boolean, event: React.MouseEvent) => void;
};

function Highlight({points, highlightStyle, onClick = noop, onHover}: HighlightProps) {
  const {fill, stroke, strokeWidth, cursor} = highlightStyle;

  return (
    <polygon
      points={points}
      fill={fill}
      stroke={stroke ?? 'none'}
      strokeWidth={strokeWidth ?? 0}
      style={{pointerEvents: 'auto', cursor: cursor ?? 'default'}}
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
};

function BlockHighlight(
  {id, points, selected}: BlockHighlightProps
) {
  const [hovered, setHoveredLocal] = useState(false);

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
      onHover={(hovering) => {
        setHoveredLocal(hovering);
        setHovered(hovering ? id : null);
      }}
    />
  );
}

type WordHighlightProps = {
  id: Id;
  points: string;
  text: string;
  selected: boolean;
  setTooltip: (tooltip: TooltipProps | null) => void;
};

function WordHighlight(
  {id, points, text, selected, setTooltip}: WordHighlightProps
) {
  const [hovered, setHoveredLocal] = useState(false);

  const highlightStyle: HighlightStyle = {
    fill: selected ? 'rgba(0,255,0,0.35)'
      : hovered ? 'rgba(0,0,0,0.1)'
        : 'transparent',
    cursor: 'pointer'
  };

  return (
    <Highlight
      points={points}
      highlightStyle={highlightStyle}
      onClick={() => toggleClicked(id)}
      onHover={(hovering, e) => {
        setHoveredLocal(hovering);
        setHovered(hovering ? id : null);
        if (!hovering) {
          setTooltip(null);
        } else {
          setTooltip({text, x: e.clientX, y: e.clientY});
        }
      }}
    />
  );
}