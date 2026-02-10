import React, {useLayoutEffect, useRef} from 'react';
import type {Annotation} from '../AnnoModel';
import type {Id} from '../Id';
import type {View} from '../View';
import {renderDiplomaticView} from '../renderDiplomaticView';
import {ViewFit} from '../calcScaleFactor';
import {useVisibility} from "./useVisibility";
import {useViewSelection} from "./useViewSelection";

export type DiplomaticViewProps = {
  annotations: Record<Id, Annotation>;
  page: { width: number; height: number };
  fit?: ViewFit;
  showRegions?: boolean;
  showEntities?: boolean;
  visible?: boolean;
  selected?: Id[];
  style?: React.CSSProperties;
};

export function DiplomaticView(props: DiplomaticViewProps) {
  const {
    annotations,
    page,
    fit,
    showRegions,
    showEntities,
    visible = true,
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
    viewRef.current = renderDiplomaticView($view, annotations, {
      page,
      fit,
      showRegions,
      showEntities
    });
  }, [annotations, page, fit, showRegions, showEntities]);

  useVisibility(containerRef, visible);
  useViewSelection(viewRef, selected);

  return <div ref={containerRef} style={style}/>;
}