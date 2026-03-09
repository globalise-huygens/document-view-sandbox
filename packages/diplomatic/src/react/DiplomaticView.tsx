import React, {useLayoutEffect, useRef} from 'react';
import type {Id} from '@knaw-huc/original-layout';
import type {View} from '@knaw-huc/original-layout';
import {renderDiplomaticView} from '../renderDiplomaticView';
import {ViewFit} from '@knaw-huc/original-layout';
import {useVisibility} from '@knaw-huc/original-layout';
import {useSelectedIds} from '@knaw-huc/original-layout';
import {Annotation} from '@globalise/annotation';
import {Benchmark} from "../../../../src/util/Benchmark.ts";

const bench = new Benchmark(renderDiplomaticView.name)

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
    function render() {
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
    }
    bench.run(() => render());
  }, [annotations, page, fit, showRegions, showEntities, onHover]);

  useVisibility(containerRef, visible);
  useSelectedIds(viewRef, selected);

  return <div ref={containerRef} style={style} />;
}