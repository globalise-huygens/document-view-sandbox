import React, {useLayoutEffect, useRef} from 'react';
import type {Annotation} from '../AnnoModel';
import type {Id} from '../Id';
import type {View} from '../View';
import {renderLineByLineView} from '../../normalized/renderLineByLineView';
import {useVisibility} from "./useVisibility";
import {useViewSelection} from "./useViewSelection";

export type LineByLineLayoutProps = {
  annotations: Record<Id, Annotation>;
  visible?: boolean;
  selected?: Id[];
  style?: React.CSSProperties;
};

export function LineByLineLayout(props: LineByLineLayoutProps) {
  const {annotations, visible = true, selected = [], style} = props;

  const containerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<View>(null);

  useLayoutEffect(() => {
    const $view = containerRef.current;
    if (!$view) {
      return;
    }

    $view.innerHTML = '';
    viewRef.current = renderLineByLineView({$view, annotations});
  }, [annotations]);

  useVisibility(containerRef, visible);
  useViewSelection(viewRef, selected);

  return <div ref={containerRef} style={style} />;
}