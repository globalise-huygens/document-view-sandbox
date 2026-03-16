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
  onClick?: (id: Id) => void;
  style?: React.CSSProperties;
};

export function LineByLineLayout(props: LineByLineLayoutProps) {
  const {
    annotations,
    visible = true,
    selected = [],
    onHover,
    onClick,
    style
  } = props;

  const containerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<View>(null);

  useLayoutEffect(() => {
    const $view = containerRef.current;
    if (!$view) {
      return;
    }

    $view.innerHTML = '';
    const lineByLineProps = {$view, annotations, onHover, onClick};
    viewRef.current = renderLineByLineView(lineByLineProps);
  }, [annotations, onHover, onClick]);

  useVisibility(containerRef, visible);
  useSelectedIds(viewRef, selected);

  return <div ref={containerRef} style={style}/>;
}