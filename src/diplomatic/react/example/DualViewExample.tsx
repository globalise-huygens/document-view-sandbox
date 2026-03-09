import React, {useEffect, useMemo, useState} from 'react';
import {createPortal} from 'react-dom';
import {$} from '../../example/$';
import {DiplomaticView, useAnnotationPage} from "@globalise/diplomatic";
import {Id} from "@knaw-huc/original-layout";
import {ControlBar} from "./ControlBar";
import {LineByLineLayout} from "@globalise/line-by-line";

export function DualViewExample() {
  const pagePath = '../../iiif/annotations/transcriptions/NL-HaNA_1.04.02_3598_0797.json';
  const {annotations: pageAnnotations, page} = useAnnotationPage(pagePath);

  const entityPath = '../../iiif/annotations/entities/NL-HaNA_1.04.02_3598_0797.json';
  const {annotations: entityAnnotations} = useAnnotationPage(entityPath);

  const [showDiplomatic, setShowDiplomatic] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Array<Id>>([]);

  const annotations = useMemo(
    () => ({...pageAnnotations, ...entityAnnotations}),
    [pageAnnotations, entityAnnotations]
  );

  useEffect(() => {
    console.log({showDiplomatic})
  }, [showDiplomatic]);

  if (!pageAnnotations || !entityAnnotations || !page) {
    return <div>Loading…</div>;
  }

  function toggleAnnotation(id: Id) {
    setSelectedIds(prev =>
      prev.includes(id)
        ? prev.filter(i => i !== id)
        : [...prev, id]
    );
  }

  const words = Object.values(pageAnnotations).filter(a => a.textGranularity === 'word');
  const regions = Object.values(pageAnnotations).filter(a => a.textGranularity === 'block');

  return (
    <>
      {createPortal(
        <ControlBar
          words={words}
          regions={regions}
          onToggleView={() => setShowDiplomatic(show => !show)}
          onToggleAnnotation={toggleAnnotation}
        />,
        $('#menu'),
      )}
      <div className="dual-view" style={{display: 'grid'}}>
        <DiplomaticView
          visible={showDiplomatic}
          annotations={annotations}
          selected={selectedIds}
          page={page}
          showEntities={true}
          showRegions={true}
          fit="height"
          style={{height: '100vh', gridArea: '1 / 1'}}
        />
        <LineByLineLayout
          visible={!showDiplomatic}
          annotations={annotations}
          selected={selectedIds}
          style={{gridArea: '1 / 1'}}
        />
      </div>
    </>
  );
}
