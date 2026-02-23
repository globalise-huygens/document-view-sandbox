import React, {useLayoutEffect, useRef} from 'react';
import type {Id} from '@knaw-huc/original-layout';
import type {View} from '@knaw-huc/original-layout';
import {renderDiplomaticView} from '../renderDiplomaticView';
import {ViewFit} from '@knaw-huc/original-layout';
import {useVisibility} from "@knaw-huc/original-layout";
import {useSelectedIds} from "@knaw-huc/original-layout";
import {Annotation} from "../anno/AnnoModel.ts";

export type DiplomaticViewProps = {
  annotations: Record<Id, Annotation>;
  page: {width: number; height: number};
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
      showEntities,
    });
  }, [annotations, page, fit, showRegions, showEntities]);

  useVisibility(containerRef, visible);
  useSelectedIds(viewRef, selected);

  return <div ref={containerRef} style={style} />;
}
