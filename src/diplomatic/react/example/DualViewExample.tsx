import React, {useMemo, useRef, useState} from 'react';
import {createPortal} from 'react-dom';
import type {Id} from '../../Id';
import type {View} from '../../View';
import type {Annotation} from '../../AnnoModel';
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

  const diplomaticRef = useRef<View>(null);
  const lineByLineRef = useRef<View>(null);
  const [, setShowDiplomatic] = useState(true);
  const [, setSelectedIds] = useState<Set<Id>>(new Set());

  const annotations = useMemo(
    () => ({...pageAnnotations, ...entityAnnotations}),
    [pageAnnotations, entityAnnotations]
  );

  if (!pageAnnotations || !entityAnnotations || !page) {
    return <div>Loading…</div>;
  }

  function toggleAnnotation(id: Id) {
    const views = [
      diplomaticRef.current,
      lineByLineRef.current
    ].filter(v => !!v) as View[]

    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        views.forEach(v => v.deselectAnnotation(id));
      } else {
        next.add(id);
        views.forEach(v => v.selectAnnotation(id));
      }
      return next;
    });
  }

  function toggleView() {
    const diplomaticView = diplomaticRef.current as View
    const lineByLineView = lineByLineRef.current as View
    if (!diplomaticView || !lineByLineView) {
      console.warn(`Missing view refs: ${diplomaticView}, ${lineByLineView}`)
      return;
    }
    setShowDiplomatic(v => {
      const next = !v;
      if (next) {
        diplomaticView.show();
        lineByLineView.hide();
      } else {
        diplomaticView.hide();
        lineByLineView.show();
      }
      return next;
    });
  }

  const words = Object.values(pageAnnotations).filter(a => a.textGranularity === 'word');
  const regions = Object.values(pageAnnotations).filter(a => a.textGranularity === 'block');

  return (
    <>
      {createPortal(
        <Controls
          words={words}
          regions={regions}
          onToggleView={toggleView}
          onToggleAnnotation={toggleAnnotation}
        />,
        $('#menu'),
      )}
      <div className="dual-view" style={{display: 'grid'}}>
        <DiplomaticView
          ref={diplomaticRef}
          annotations={annotations}
          page={page}
          showEntities={true}
          showRegions={true}
          fit="height"
          style={{height: '100vh', gridArea: '1 / 1'}}
        />
        <LineByLineLayout
          ref={lineByLineRef}
          annotations={annotations}
          style={{gridArea: '1 / 1', visibility: 'hidden'}}
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