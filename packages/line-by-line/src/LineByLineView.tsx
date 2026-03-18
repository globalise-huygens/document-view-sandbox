import React from 'react';
import {Id, Annotation} from '@globalise/common/annotation';
import {NormalizedLayout} from './NormalizedLayout';
import {useLineSegments} from './useLineSegments';

export type LineByLineLayoutProps = {
  annotations: Record<Id, Annotation>;
  selected?: Id[];
  style?: React.CSSProperties;
};

export function LineByLineView(
  {annotations, selected = [], style}: LineByLineLayoutProps
) {
  const lineSegments = useLineSegments(annotations);

  return (
    <div style={style}>
      <NormalizedLayout
        lineSegments={lineSegments}
        annotations={annotations}
        selected={selected}
      />
    </div>
  );
}
