import React, {useEffect, useState} from 'react';
import {useCanvas, ViewerCanvas} from '@knaw-huc/osd-iiif-viewer';
import {Annotation, AnnotationPage, Id, PartOf,} from '@globalise/annotation';
import {DiplomaticView} from '@globalise/diplomatic';
import {LineByLineLayout} from '@globalise/line-by-line';
import {LoadingStatus} from "./LoadingStatus";

type TranscriptionViewProps = {
  selected: Id[];
  onHover: (id: Id | null) => void;
  onClick: (id: Id) => void;
};

export function TranscriptionView(
  {selected, onHover, onClick}: TranscriptionViewProps
) {
  const {current} = useCanvas();
  const [showDiplomatic, setShowDiplomatic] = useState(true);
  const [annotations, setAnnotations] = useState<Record<Id, Annotation> | null>(null);
  const [page, setPage] = useState<PartOf | null>(null);
  const [status, setStatus] = useState<LoadingStatus>('loading');
  
  useEffect(() => {
    if(!current) {
      return;
    }

    loadAnnotations(current);

    async function loadAnnotations(
      current: ViewerCanvas
    ) {
      const transcriptionUrl = current.annotationPageIds[0];
      const entityUrl = current.annotationPageIds[1];

      if (!transcriptionUrl) {
        setStatus('no-transcription')
        return;
      }

      const transcriptionPage: AnnotationPage = await fetch(transcriptionUrl)
        .then(r => r.json());

      const mapped: Record<Id, Annotation> = {};
      for (const item of transcriptionPage.items) {
        mapped[item.id] = item;
      }
      if (entityUrl) {
        const entityPage: AnnotationPage = await fetch(entityUrl)
          .then(r => r.json())
        for (const item of entityPage.items) {
          mapped[item.id] = item;
        }
      }
      setAnnotations(mapped);
      setPage(transcriptionPage.partOf);
      setStatus('ready')
    }

  }, [current]);

  if (status === 'loading' || !annotations || !page) {
    return <div>Loading...</div>;
  }

  if (status === 'no-transcription') {
    return <div>No transcription</div>;
  }

  return (
    <div className="transcription-view">
      <div className="controls">
        <button
          className={showDiplomatic ? 'active' : ''}
          onClick={() => setShowDiplomatic(true)}
        >
          Diplomatic
        </button>
        <button
          className={!showDiplomatic ? 'active' : ''}
          onClick={() => setShowDiplomatic(false)}
        >
          Line by line
        </button>
      </div>
      <div className="content">
        <DiplomaticView
          visible={showDiplomatic}
          annotations={annotations}
          selected={selected}
          page={page}
          showEntities={true}
          showRegions={true}
          fit="height"
          onHover={onHover}
          onClick={onClick}
          style={{height: '100%', gridArea: '1 / 1'}}
        />
        <LineByLineLayout
          visible={!showDiplomatic}
          annotations={annotations}
          selected={selected}
          onHover={onHover}
          onClick={onClick}
          style={{gridArea: '1 / 1'}}
        />
      </div>
    </div>
  );
}