import {
  useCanvas,
  HighlightOverlay,
  type Highlight,
} from '@knaw-huc/osd-iiif-viewer';
import React, {useEffect, useState} from "react";
import {
  type AnnotationPage,
  type Annotation,
  findTextualBodyValue,
  findSvgPath,
} from '@knaw-huc/original-layout/diplomatic';

export function LineHighlightOverlay() {
  const {current} = useCanvas();
  const [fragments, setFragments] = useState<Highlight[]>([]);
  const [texts, setTexts] = useState<Record<string, string>>({});
  const [tooltip, setTooltip] = useState<TooltipProps | null>();

  useEffect(() => {
    const url = current?.annotationPageIds[0];
    if (!url) {
      setFragments([]);
      setTexts({});
      return;
    }
    fetch(url)
      .then((r) => r.json())
      .then((page: AnnotationPage) => {
        const lines = page.items.filter(isSupplementingLine);
        setFragments(lines.map((a) => ({id: a.id, path: findSvgPath(a)})));
        setTexts(Object.fromEntries(
          lines.map((a) => [a.id, findTextualBodyValue(a)])
        ));
      });
  }, [current]);

  return (
    <>
      <HighlightOverlay
        highlights={fragments}
        onHover={(id, event) => {
          if (!id) {
            setTooltip(null);
          } else {
            setTooltip({text: texts[id], x: event.clientX, y: event.clientY});
          }
        }}
      />
      {tooltip && <Tooltip x={tooltip.x} y={tooltip.y} text={tooltip.text}/>}
    </>
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
    a.textGranularity === 'line';
}