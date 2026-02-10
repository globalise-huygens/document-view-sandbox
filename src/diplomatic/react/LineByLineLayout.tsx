import React, {useLayoutEffect, useRef} from 'react';
import type {Annotation} from '../AnnoModel';
import type {Id} from '../Id';
import type {View} from '../View';
import {renderLineByLineView} from '../../normalized/renderLineByLineView';

export type LineByLineLayoutProps = {
  annotations: Record<Id, Annotation>;
  visible?: boolean;
  selected?: Id[];
  style?: React.CSSProperties;
};

export function LineByLineLayout(props: LineByLineLayoutProps) {
  const {annotations, visible = true, selected = [], style} = props;

  const containerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<View | null>(null);
  const prevSelectedRef = useRef<Id[]>([]);

  useLayoutEffect(() => {
    const $view = containerRef.current;
    if (!$view) {
      return;
    }

    $view.innerHTML = '';
    viewRef.current = renderLineByLineView({$view, annotations});
  }, [annotations]);

  useLayoutEffect(() => {
    const $view = containerRef.current;
    if (!$view) {
      return;
    }
    $view.style.visibility = visible ? 'visible' : 'hidden';
  }, [visible]);

  useLayoutEffect(() => {
    const view = viewRef.current;
    if (!view) {
      return;
    }
    prevSelectedRef.current.forEach(id => view.deselectAnnotation(id));
    selected.forEach(id => view.selectAnnotation(id));
    prevSelectedRef.current = selected;
  }, [selected]);

  return <div ref={containerRef} style={style} />;
}