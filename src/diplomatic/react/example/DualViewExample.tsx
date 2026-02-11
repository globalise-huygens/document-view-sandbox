import React, {useEffect, useMemo, useRef, useState} from 'react';
import {createPortal} from 'react-dom';
import type {Id} from '../../anno/Id';
import type {Annotation} from '../../anno/AnnoModel';
import {useAnnotationPage} from '../useAnnotationPage';
import {DiplomaticView} from '../DiplomaticView';
import {LineByLineLayout} from '../LineByLineLayout';
import {findTextualBodyValue} from '../../anno/findTextualBodyValue';
import {findSourceLabel} from '../../anno/findSourceLabel';
import {$} from '../../example/$';

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
        <Controls
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

function Controls({words, regions, onToggleView, onToggleAnnotation}: {
  words: Annotation[];
  regions: Annotation[];
  onToggleView: () => void;
  onToggleAnnotation: (id: Id) => void;
}) {
  return (
    <span className="controls">
      <button onClick={onToggleView}>Toggle view</button>
      <AnnotationDropdown
        placeholder="Toggle words"
        options={words}
        toLabel={findTextualBodyValue}
        onSelect={onToggleAnnotation}
      />
      <AnnotationDropdown
        placeholder="Toggle regions"
        options={regions}
        toLabel={findSourceLabel}
        onSelect={onToggleAnnotation}
      />
    </span>
  );
}

function AnnotationDropdown({placeholder, options, toLabel, onSelect}: {
  placeholder: string;
  options: Annotation[];
  toLabel: (a: Annotation) => string;
  onSelect: (id: Id) => void;
}) {
  const selectRef = useRef<HTMLSelectElement>(null);

  return (
    <select
      ref={selectRef}
      defaultValue=""
      onChange={(e) => {
        onSelect(e.target.value);
        if (selectRef.current) {
          selectRef.current.selectedIndex = 0;
        }
      }}
    >
      <option value="" disabled>{placeholder}</option>
      {options.map(a => (
        <option key={a.id} value={a.id}>{toLabel(a)}</option>
      ))}
    </select>
  );
}