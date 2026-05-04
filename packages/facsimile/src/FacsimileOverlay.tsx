import {Overlay, useImageInfo} from '@knaw-huc/osd-iiif-viewer';
import {useMemo, useState} from 'react';
import {
  findSvgPath,
  findTextualBodyValue,
  isBlock,
  isWord,
  parseSvgPath,
} from '@globalise/common/annotation';
import {
  useAnnotations,
} from '@globalise/common/document';
import {Tooltip, TooltipProps} from './Tooltip';
import {BlockHighlight} from './BlockHighlight.tsx';
import {WordHighlight} from './WordHighlight.tsx';

export function FacsimileOverlay() {
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
            />
          ))}
          {words.map(({id, path, text}) => (
            <WordHighlight
              key={id}
              id={id}
              points={path}
              text={text}
              setTooltip={setTooltip}
            />
          ))}
        </svg>
      </Overlay>
      {tooltip && <Tooltip x={tooltip.x} y={tooltip.y} text={tooltip.text}/>}
    </>
  );
}