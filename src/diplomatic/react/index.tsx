import React, {useEffect, useState} from 'react';
import {createRoot} from 'react-dom/client';
import type {Annotation, AnnotationPage, PartOf} from '../AnnoModel';
import type {Id} from '../Id';
import {OriginalLayout} from './OriginalLayout';
import {$} from "../example/$";

function App() {
  const path = '../../iiif/annotations/transcriptions/NL-HaNA_1.04.02_3598_0797.json'
  const [annotations, setAnnotations] = useState<Record<Id, Annotation>>();
  const [page, setPage] = useState<PartOf>();

  useEffect(() => {
    fetch(path)
      .then((r) => r.json())
      .then((result: AnnotationPage) => {
        const mapped: Record<Id, Annotation> = {};
        for (const item of result.items) {
          mapped[item.id] = item;
        }
        setAnnotations(mapped);
        setPage(result.partOf);
      });
  }, []);

  if (!annotations || !page) {
    return <div>Loading...</div>;
  }

  return (
    <OriginalLayout
      annotations={annotations}
      config={{page}}
    />
  );
}

document.addEventListener('DOMContentLoaded', () => {
  const $root = $('#root');
  createRoot($root).render(<App/>);
});