import {useEffect, useState} from 'react';
import {Id} from "@knaw-huc/original-layout";
import {Annotation, AnnotationPage, PartOf} from '@globalise/common/annotation';

export function useAnnotationPage(path: string) {
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
  }, [path]);

  return {annotations, page};
}
