import {useEffect, RefObject} from 'react';
import {useViewer} from '@knaw-huc/osd-iiif-viewer';
import {
  useAnnotations,
  useTextGranularity,
  useDocumentStore, usePartOf,
} from '@globalise/common/document';
import {
  isWord,
  findSvgPath,
  parseSvgPath,
  Id,
  Annotation
} from '@globalise/common/annotation';
import {calcBoundingBox, createPoints} from '@knaw-huc/original-layout';

export function useZoomToClicked() {
  const pageSize = usePartOf();
  const viewer = useViewer();
  const annotations = useAnnotations();
  const {wordsToLine} = useTextGranularity();
  const {entityToWords} = useDocumentStore(s => s.entityOverlap);
  const clickedId = useDocumentStore(s => s.clickedId);

  useEffect(() => {
    if (!clickedId || !annotations || !viewer) {
      return;
    }

    const ids = findSelectedWords(clickedId, annotations, entityToWords);
    if (!ids.length) {
      console.log('Could not resolve to words', clickedId);
      return;
    }

    const allPoints = ids.flatMap(id => {
      return createPoints(parseSvgPath(findSvgPath(annotations[id])));
    });
    const bbox = calcBoundingBox(allPoints);
    const padding = pageSize ? pageSize.width * 0.05 : 100;
    const zoomViewport = viewer.viewport.imageToViewportRectangle(
      bbox.left - padding,
      bbox.top - padding,
      bbox.width + padding * 2,
      bbox.height + padding * 2,
    );
    viewer.viewport.fitBounds(zoomViewport);
    }, [clickedId, annotations, viewer, wordsToLine, entityToWords, pageSize]
  );
}

function findSelectedWords(
  clicked: Id,
  annotations: Record<Id, Annotation>,
  entityToWords: Record<Id, Id[]>
): Id[] {
  const annotation = annotations[clicked];
  if (!annotation) {
    return [];
  }
  if (isWord(annotation)) {
    return [clicked];
  }
  return entityToWords[clicked] ?? [];
}