import React from "react";
import {noop} from "@globalise/common";
import {HighlightStyle} from "./HighlightStyle.tsx";

type HighlightProps = {
  points: string;
  highlightStyle: HighlightStyle;
  onClick?: () => void;
  onHover?: (hovering: boolean, event: React.MouseEvent) => void;
};

export function Highlight(
  {
    points,
    highlightStyle,
    onClick = noop,
    onHover = noop
  }: HighlightProps) {
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
