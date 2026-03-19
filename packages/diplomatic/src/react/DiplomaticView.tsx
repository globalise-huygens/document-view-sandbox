import React, {useLayoutEffect, useRef} from 'react';
import type {Id} from '@knaw-huc/original-layout';
import {ViewFit} from '@knaw-huc/original-layout';
import {renderDiplomaticView} from '../renderDiplomaticView';

import '@knaw-huc/original-layout/style.css';
import {Annotation} from '@globalise/common/annotation';
import {setHovered, toggleClicked} from '@globalise/common/document';
import {View} from '@globalise/common';

export type DiplomaticViewProps = {
  annotations: Record<Id, Annotation>;
  page: {width: number; height: number};
  fit?: ViewFit;
  showBlocks?: boolean;
  showScanMargin?: boolean;
  selected?: Id[];
  style?: React.CSSProperties;
};

export function DiplomaticView(props: DiplomaticViewProps) {
  const {
    annotations,
    page,
    fit,
    showBlocks,
    showScanMargin,
    selected = [],
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
      showBlocks,
      showScanMargin,
      onHover: setHovered,
      onClick: toggleClicked,
    });
    view.setSelected(...selected);
    viewRef.current = view;
  }, [annotations, page, fit, showBlocks]);

  useLayoutEffect(() => {
    viewRef.current?.setSelected(...selected);
  }, [selected]);

  return <div ref={containerRef} style={style} />;
}