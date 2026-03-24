import React, {useMemo} from 'react';
import {Overlay, useImageInfo} from '@knaw-huc/osd-iiif-viewer';
import {useAnnotations} from '@globalise/common/document';
import {
  toggleClicked,
  setHovered,
  useIsSelectedInFacsimile,
} from '@globalise/common/document';
import {
  findSvgPath,
  Id,
  isWord,
  parseSvgPath,
} from '@globalise/common/annotation';

export function MinimapOverlay() {
  const viewImage = useImageInfo();
  const annotations = useAnnotations();

  const words = useMemo(() => {
    if (!annotations) {
      return [];
    }
    return Object.values(annotations)
      .filter(isWord)
      .map(a => ({id: a.id, path: parseSvgPath(findSvgPath(a))}));
  }, [annotations]);

  if (!viewImage || !words.length) {
    return null;
  }

  return (
    <Overlay location={viewImage.location}>
      <svg
        viewBox={`0 0 ${viewImage.size.x} ${viewImage.size.y}`}
        style={{width: '100%', height: '100%', pointerEvents: 'none'}}
      >
        {words.map(({id, path}) => (
          <WordPolygon key={id} id={id} path={path} />
        ))}
      </svg>
    </Overlay>
  );
}

function WordPolygon({id, path}: {id: Id; path: string}) {
  const isSelected = useIsSelectedInFacsimile(id);

  return (
    <polygon
      points={path}
      fill={isSelected ? 'rgba(0,255,0,0.3)' : 'transparent'}
      style={{pointerEvents: 'all', cursor: 'pointer'}}
      onClick={() => toggleClicked(id)}
      onMouseEnter={() => setHovered(id)}
      onMouseLeave={() => setHovered(null)}
    />
  );
}