import React, {useLayoutEffect, useRef} from 'react';
import type {Id} from '@knaw-huc/original-layout';
import {ViewFit} from '@knaw-huc/original-layout';
import {renderDiplomaticView} from '../renderDiplomaticView';

import '@knaw-huc/original-layout/style.css';
import {Annotation} from '@globalise/common/annotation';
import {
  setHovered,
  toggleClicked,
  useSelectedIds
} from '@globalise/common/DocumentStore';
import {View} from "@globalise/common";

export type DiplomaticViewProps = {
  annotations: Record<Id, Annotation>;
  page: {width: number; height: number};
  fit?: ViewFit;
  showBlocks?: boolean;
  showScanMargin?: boolean;
  style?: React.CSSProperties;
};

export function DiplomaticView(props: DiplomaticViewProps) {
  const {
    annotations,
    page,
    fit,
    showBlocks,
    showScanMargin,
    style,
  } = props;

  const containerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<View>(null);
  const selectedIds = useSelectedIds();

  useLayoutEffect(() => {
    const $view = containerRef.current;
    if (!$view) {
      return;
    }
    $view.innerHTML = '';
    const view = renderDiplomaticView($view, annotations, {
      page,
      fit,
      showBlocks,
      showScanMargin,
      onHover: setHovered,
      onClick: toggleClicked,
    });
    view.setSelected(...selectedIds);
    viewRef.current = view;
  }, [annotations, page, fit, showBlocks]);

  useLayoutEffect(() => {
    viewRef.current?.setSelected(...selectedIds);
  }, [selectedIds]);

  return <div ref={containerRef} style={style} />;
}