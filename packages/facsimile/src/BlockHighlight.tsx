import {useState} from "react";
import {setHovered} from "@globalise/common/DocumentStore";
import {Highlight} from "./Highlight.tsx";
import {Id} from "@globalise/common/annotation";
import {HighlightStyle} from "./HighlightStyle.tsx";

type BlockHighlightProps = {
  id: Id;
  points: string;
  selected: boolean;
};


export function BlockHighlight(
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