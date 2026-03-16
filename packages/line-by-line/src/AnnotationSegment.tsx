import {ReactNode} from 'react';
import {
  Annotation,
  getEntityType,
  isEntity,
  toClassName,
  Id, isWord,
} from '@globalise/common/annotation';

type AnnotationProps = {
  annotation: Annotation;
  selected: Id[];
  onHover: (id: Id | null) => void;
  onClick: (id: Id) => void;
  children: ReactNode;
};

export function AnnotationSegment(
  {annotation, children, ...props}: AnnotationProps
) {
  if (isWord(annotation)) {
    return <WordSegment annotation={annotation} {...props}>
      {children}
    </WordSegment>;
  }

  if (isEntity(annotation)) {
    return <EntitySegment annotation={annotation}>
      {children}
    </EntitySegment>;
  }

  return <>{children}</>;
}

function WordSegment(
  {annotation, selected, onHover, onClick, children}: AnnotationProps
) {
  const isSelected = selected.includes(annotation.id);
  return (
    <span
      className={`word${isSelected ? ' selected' : ''}`}
      onMouseEnter={() => onHover(annotation.id)}
      onMouseLeave={() => onHover(null)}
      onClick={() => onClick(annotation.id)}
    >
        {children}
      </span>
  );
}

type EntityProps = {
  annotation: Annotation;
  children: ReactNode;
};

function EntitySegment({annotation, children}: EntityProps) {
  const entityType = getEntityType(annotation);
  return (
    <span
      className={`entity ${toClassName(entityType)}`}
      title={`${entityType} | ${annotation.id}`}
    >
        {children}
      </span>
  );
}