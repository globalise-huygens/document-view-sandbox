import {Overlay, useImageInfo} from '@knaw-huc/osd-iiif-viewer';
import {useMemo, useState} from 'react';
import {
  findSvgPath,
  findTextualBodyValue,
  Id,
  isBlock,
  isWord,
  parseSvgPath,
  useAnnotations,
  useEntityOverlap,
  useTextGranularity,
} from '@globalise/common/annotation';
import {useDocumentStore} from '@globalise/common/DocumentStore';
import {Tooltip, TooltipProps} from './Tooltip';
import {BlockHighlight} from "./BlockHighlight.tsx";
import {WordHighlight} from "./WordHighlight.tsx";

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