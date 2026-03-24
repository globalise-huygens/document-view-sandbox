import React from 'react';
import {Id, Annotation} from '@globalise/common/annotation';
import {NormalizedLayout} from './NormalizedLayout';
import {useLineSegments} from './useLineSegments';

export type LineByLineLayoutProps = {
  annotations: Record<Id, Annotation>;
  style?: React.CSSProperties;
};

export const LineByLineView = React.memo(function LineByLineView(
  {annotations, style}: LineByLineLayoutProps
) {
  const lineSegments = useLineSegments(annotations);

  return (
    <div style={style}>
      <NormalizedLayout lineSegments={lineSegments} />
    </div>
  );
});