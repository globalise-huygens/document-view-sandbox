import React, {useLayoutEffect, useRef} from 'react';
import {renderLineByLineView} from '../renderLineByLineView';
import {
  Id,
  useSelectedIds,
  useVisibility,
  View
} from '@knaw-huc/original-layout';
import {Annotation} from '@globalise/annotation';

export type LineByLineLayoutProps = {
  annotations: Record<Id, Annotation>;
  visible?: boolean;
  selected?: Id[];
  onHover?: (id: Id | null) => void;
  style?: React.CSSProperties;
};

export function LineByLineLayout(props: LineByLineLayoutProps) {
  const {annotations, visible = true, selected = [], onHover, style} = props;

  const containerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<View>(null);

  useLayoutEffect(() => {
    const $view = containerRef.current;
    if (!$view) {
      return;
    }

    $view.innerHTML = '';
    viewRef.current = renderLineByLineView({$view, annotations, onHover});
  }, [annotations, onHover]);

  useVisibility(containerRef, visible);
  useSelectedIds(viewRef, selected);

  return <div ref={containerRef} style={style} />;
}