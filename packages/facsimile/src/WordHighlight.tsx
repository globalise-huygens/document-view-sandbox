import  {useState} from "react";
import {HighlightStyle} from "./HighlightStyle.tsx";
import {setHovered, toggleClicked} from "@globalise/common/DocumentStore";
import {Highlight} from "./Highlight.tsx";
import {Id} from "@globalise/common/annotation";
import {TooltipProps} from "./Tooltip.tsx";

type WordHighlightProps = {
  id: Id;
  points: string;
  text: string;
  selected: boolean;
  setTooltip: (tooltip: TooltipProps | null) => void;
};


export function WordHighlight(
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