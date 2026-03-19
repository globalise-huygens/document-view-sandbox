import {ReactNode} from 'react';
import {
  Annotation,
  getEntityType,
  isEntity,
  toClassName,
  isWord,
} from '@globalise/common/annotation';
import {useIsSelectedInTranscription} from '@globalise/common/document';

type AnnotationProps = {
  annotation: Annotation;
  children: ReactNode;
};

export function AnnotationSegment(
  {annotation, children}: AnnotationProps
) {
  if (isEntity(annotation)) {
    return <EntitySegment annotation={annotation}>
      {children}
    </EntitySegment>;
  }

  if (isWord(annotation)) {
    return <WordSegment annotation={annotation}>
      {children}
    </WordSegment>;
  }

  return <>{children}</>;
}

function WordSegment({annotation, children}: AnnotationProps) {
  const isSelected = useIsSelectedInTranscription(annotation.id);
  return (
    <span className={`word${isSelected ? ' selected' : ''}`}>
      {children}
    </span>
  );
}

function EntitySegment({annotation, children}: AnnotationProps) {
  const entityType = getEntityType(annotation);
  const isSelected = useIsSelectedInTranscription(annotation.id);
  return (
    <span
      className={`entity ${toClassName(entityType)}${isSelected ? ' selected' : ''}`}
      title={`${entityType} | ${annotation.id}`}
    >
      {children}
    </span>
  );
}