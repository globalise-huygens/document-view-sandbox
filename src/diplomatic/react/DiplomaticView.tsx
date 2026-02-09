import React, {
  forwardRef,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
} from 'react';
import type {Annotation} from '../AnnoModel';
import type {Id} from '../Id';
import type {View} from '../View';
import {renderDiplomaticView,} from '../renderDiplomaticView';
import {ViewFit} from "../calcScaleFactor";
import {ViewRef} from "./ViewRef";

export type DiplomaticViewProps = {
  annotations: Record<Id, Annotation>;
  page: { width: number; height: number };
  fit?: ViewFit;
  showRegions?: boolean;
  showEntities?: boolean;
  visible?: boolean;
  style?: React.CSSProperties;
};

export const DiplomaticView = forwardRef<
  ViewRef,
  DiplomaticViewProps
>(function DiplomaticView(props, ref) {
  const {
    annotations,
    page,
    fit,
    showRegions,
    showEntities,
    style,
    visible = true,
  } = props
  const containerRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<ViewRef>(null);

  useLayoutEffect(() => {
    const $view = containerRef.current;
    if (!$view) {
      return;
    }

    $view.innerHTML = '';
    const config = {page, fit, showRegions, showEntities};
    handleRef.current = renderDiplomaticView($view, annotations, config);
  }, [annotations, page, fit, showRegions, showEntities]);

  useLayoutEffect(() => {
    const $view = containerRef.current;
    if (!$view) {
      return;
    }
    $view.style.visibility = visible ? 'visible' : 'hidden';
  }, [visible]);

  useImperativeHandle(
    ref,
    () => handleRef.current!,
    [annotations, page, fit, showRegions, showEntities]
  );

  return <div
    ref={containerRef}
    style={style}
  />;
});