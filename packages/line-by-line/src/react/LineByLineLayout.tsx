import React, {useLayoutEffect, useRef} from 'react';
import {renderLineByLineView} from '../renderLineByLineView';
import {Id} from '@knaw-huc/original-layout';
import {Annotation} from '@globalise/common/annotation';
import {View} from "../View.ts";

export type LineByLineLayoutProps = {
  annotations: Record<Id, Annotation>;
  selected?: Id[];
  onHover?: (id: Id | null) => void;
  onClick?: (id: Id) => void;
  style?: React.CSSProperties;
};

export function LineByLineLayout(props: LineByLineLayoutProps) {
  const {
    annotations,
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
    const view = renderLineByLineView(lineByLineProps);
    view.setSelected(...selected);
    viewRef.current = view;
  }, [annotations, onHover, onClick]);

  useLayoutEffect(() => {
    viewRef.current?.setSelected(...selected);
  }, [selected]);

  return <div ref={containerRef} style={style}/>;
}