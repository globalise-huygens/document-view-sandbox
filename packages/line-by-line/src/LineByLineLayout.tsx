import React from 'react';
import {Id, Annotation} from '@globalise/common/annotation';
import {NormalizedLayout} from './NormalizedLayout';
import {useLineSegments} from './useLineSegments';
import {noop} from '@globalise/common';

export type LineByLineLayoutProps = {
  annotations: Record<Id, Annotation>;
  selected?: Id[];
  onHover?: (id: Id | null) => void;
  onClick?: (id: Id) => void;
  style?: React.CSSProperties;
};

export function LineByLineLayout(
  {
    annotations,
    selected = [],
    onHover = noop,
    onClick = noop,
    style
  }: LineByLineLayoutProps
) {
  const lineSegments = useLineSegments(annotations);

  return (
    <div style={style}>
      <NormalizedLayout
        lineSegments={lineSegments}
        annotations={annotations}
        selected={selected}
        onHover={onHover}
        onClick={onClick}
      />
    </div>
  );
}