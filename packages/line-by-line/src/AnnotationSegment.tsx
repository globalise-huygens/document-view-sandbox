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
  blockId: Id | null;
  selected: Id[];
  onHover: (id: Id | null) => void;
  onClick: (id: Id) => void;
  children: ReactNode;
};

export function AnnotationSegment(
  {annotation, children, ...props}: AnnotationProps
) {
  if (isWord(annotation)) {
    return <WordSegment annotation={annotation} selected={props.selected}>
      {children}
    </WordSegment>;
  }

  if (isEntity(annotation)) {
    return <EntitySegment annotation={annotation} {...props}>
      {children}
    </EntitySegment>;
  }

  return <>{children}</>;
}

type WordProps = {
  annotation: Annotation;
  selected: Id[];
  children: ReactNode;
};

function WordSegment({annotation, selected, children}: WordProps) {
  const isSelected = selected.includes(annotation.id);
  return (
    <span className={`word${isSelected ? ' selected' : ''}`}>
      {children}
    </span>
  );
}

function EntitySegment(
  {annotation, blockId, selected, onHover, onClick, children}: AnnotationProps
) {
  const entityType = getEntityType(annotation);
  const isSelected = selected.includes(annotation.id);
  return (
    <span
      className={`entity ${toClassName(entityType)}${isSelected ? ' selected' : ''}`}
      title={`${entityType} | ${annotation.id}`}
      onMouseEnter={(e) => {
        e.stopPropagation();
        onHover(annotation.id);
      }}
      onMouseLeave={(e) => {
        e.stopPropagation();
        onHover(blockId);
      }}
      onClick={(e) => {
        e.stopPropagation();
        onClick(annotation.id);
      }}
    >
      {children}
    </span>
  );
}