import {useState} from 'react';
import {setHovered, useIsSelectedInFacsimile} from '@globalise/common/document';
import {Highlight} from './Highlight.tsx';
import {Id} from '@globalise/common/annotation';
import {HighlightStyle} from './HighlightStyle.tsx';

type BlockHighlightProps = {
  id: Id;
  points: string;
};

export function BlockHighlight(
  {id, points}: BlockHighlightProps
) {
  const selected = useIsSelectedInFacsimile(id);
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