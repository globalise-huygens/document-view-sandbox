import {useEffect, RefObject} from 'react';
import {useViewer} from '@knaw-huc/osd-iiif-viewer';
import {
  useAnnotations,
  useTextGranularity,
  useDocumentStore, usePartOf,
} from '@globalise/common/document';
import {isWord, findSvgPath, parseSvgPath, Id} from '@globalise/common/annotation';
import {calcBoundingBox} from '@knaw-huc/original-layout';

export function useZoomToClicked(
  textRef: RefObject<HTMLDivElement | null>
) {
  const pageSize = usePartOf()
  const viewer = useViewer();
  const annotations = useAnnotations();
  const {wordsToLine} = useTextGranularity();
  const {entityToWords} = useDocumentStore(s => s.entityOverlap);
  const clickedId = useDocumentStore(s => s.clickedId);

  useEffect(() => {
    if (!clickedId || !annotations || !viewer) {
      return;
    }

    const wordId = resolveToWord(clickedId);
    if (!wordId) {
      console.log('Could not resolve to word', clickedId);
      return;
    }

    const annotation = annotations[wordId];
    const points = parsePoints(parseSvgPath(findSvgPath(annotation)));
    const bbox = calcBoundingBox(points);
    const padding = pageSize ? pageSize.width * 0.05 : 100;
    const zoomViewport = viewer.viewport.imageToViewportRectangle(
      bbox.left - padding,
      bbox.top - padding,
      bbox.width + padding * 2,
      bbox.height + padding * 2,
    );
    viewer.viewport.fitBounds(zoomViewport);

    const lineId = wordsToLine[wordId];
    if (lineId && textRef.current) {
      const lineEl = textRef.current.querySelector(
        `[data-line-id="${lineId}"]`
      );
      if (lineEl) {
        lineEl.scrollIntoView({behavior: 'smooth', block: 'center'});
      }
    }
  }, [clickedId, annotations, viewer, wordsToLine, entityToWords, textRef]);

  function resolveToWord(id: Id): Id | null {
    const annotation = annotations?.[id];
    if (!annotation) {
      return null;
    }
    if (isWord(annotation)) {
      return id;
    }
    const wordIds = entityToWords[id];
    if (wordIds?.length) {
      return wordIds[0];
    }
    return null;
  }
}

function parsePoints(pointsStr: string): [number, number][] {
  return pointsStr.split(/\s+/).map(p => {
    const [x, y] = p.split(',').map(Number);
    return [x, y];
  });
}