import {useEffect, useState} from "react";
import type {Id} from "../anno/Id";
import type {Annotation, AnnotationPage, PartOf} from "../anno/AnnoModel";

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