import React, {useLayoutEffect, useRef} from 'react';
import type {Id} from '@knaw-huc/original-layout';
import {
  ViewFit
} from '@knaw-huc/original-layout';
import {renderDiplomaticView} from '../renderDiplomaticView';

import '@knaw-huc/original-layout/style.css';
import {Annotation} from "@globalise/common/annotation";
import {View} from "@globalise/common";

export type DiplomaticViewProps = {
  annotations: Record<Id, Annotation>;
  page: {width: number; height: number};
  fit?: ViewFit;
  showBlocks?: boolean;
  showEntities?: boolean;
  showScanMargin?: boolean;
  selected?: Id[];
  onHover?: (id: Id | null) => void;
  onClick?: (id: Id) => void;
  style?: React.CSSProperties;
};

export function DiplomaticView(props: DiplomaticViewProps) {
  const {
    annotations,
    page,
    fit,
    showBlocks,
    showEntities,
    showScanMargin,
    selected = [],
    onHover,
    onClick,
    style,
  } = props;

  const containerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<View>(null);

  useLayoutEffect(() => {
    const $view = containerRef.current;
    if (!$view) {
      return;
    }
    $view.innerHTML = '';
    const view = renderDiplomaticView($view, annotations, {
      page,
      fit,
      showBlocks: showBlocks,
      showEntities,
      showScanMargin,
      onHover,
      onClick
    });
    view.setSelected(...selected);
    viewRef.current = view;
  }, [annotations, page, fit, showBlocks, showEntities, onHover]);

  useLayoutEffect(() => {
    viewRef.current?.setSelected(...selected);
  }, [selected]);

  return <div ref={containerRef} style={style} />;
}