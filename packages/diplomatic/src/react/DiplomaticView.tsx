import React, {useLayoutEffect, useRef} from 'react';
import type {Id, View} from '@knaw-huc/original-layout';
import {
  useSelectedIds,
  useVisibility,
  ViewFit
} from '@knaw-huc/original-layout';
import {renderDiplomaticView} from '../renderDiplomaticView';
import {Annotation} from '@globalise/annotation';

import '@knaw-huc/original-layout/style.css';

export type DiplomaticViewProps = {
  annotations: Record<Id, Annotation>;
  page: {width: number; height: number};
  fit?: ViewFit;
  showRegions?: boolean;
  showEntities?: boolean;
  showScanMargin?: boolean;
  visible?: boolean;
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
    showRegions,
    showEntities,
    showScanMargin,
    visible = true,
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
    viewRef.current = renderDiplomaticView($view, annotations, {
      page,
      fit,
      showRegions,
      showEntities,
      showScanMargin,
      onHover,
      onClick
    });
  }, [annotations, page, fit, showRegions, showEntities, onHover]);

  useVisibility(containerRef, visible);
  useSelectedIds(viewRef, selected);

  return <div ref={containerRef} style={style} />;
}