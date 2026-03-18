import {ReactNode} from 'react';
import {
  Annotation,
  getEntityType,
  isEntity,
  toClassName,
  Id,
  isWord,
} from '@globalise/common/annotation';

type AnnotationProps = {
  annotation: Annotation;
  selected: Id[];
  children: ReactNode;
};

export function AnnotationSegment(
  {annotation, selected, children}: AnnotationProps
) {
  if (isEntity(annotation)) {
    return <EntitySegment annotation={annotation} selected={selected}>
      {children}
    </EntitySegment>;
  }

  if (isWord(annotation)) {
    return <WordSegment annotation={annotation} selected={selected}>
      {children}
    </WordSegment>;
  }

  return <>{children}</>;
}

function WordSegment({annotation, selected, children}: AnnotationProps) {
  const isSelected = selected.includes(annotation.id);
  return (
    <span className={`word${isSelected ? ' selected' : ''}`}>
      {children}
    </span>
  );
}

function EntitySegment({annotation, selected, children}: AnnotationProps) {
  const entityType = getEntityType(annotation);
  const isSelected = selected.includes(annotation.id);
  return (
    <span
      className={`entity ${toClassName(entityType)}${isSelected ? ' selected' : ''}`}
      title={`${entityType} | ${annotation.id}`}
    >
      {children}
    </span>
  );
}