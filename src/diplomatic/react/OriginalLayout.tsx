import React, {
  forwardRef,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
} from 'react';
import type {Annotation} from '../AnnoModel';
import type {Id} from '../Id';
import type {Scale} from '../Scale';
import {renderOriginalLayout,} from '../renderOriginalLayout';
import {ViewFit} from "../calcScaleFactor";

export type OriginalLayoutProps = {
  annotations: Record<Id, Annotation>;
  page: { width: number; height: number };
  fit?: ViewFit;
  style?: React.CSSProperties;
};

export type OriginalLayoutRefResult = {
  scale: Scale;
  $words: Record<Id, HTMLElement>;
  $overlay: SVGSVGElement;
};

export const OriginalLayout = forwardRef<
  OriginalLayoutRefResult,
  OriginalLayoutProps
>(function OriginalLayout({annotations, style, page, fit}, ref) {
  const containerRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<OriginalLayoutRefResult | null>(null);

  useLayoutEffect(() => {
    const $view = containerRef.current;
    if (!$view) {
      return;
    }

    $view.innerHTML = '';
    handleRef.current = renderOriginalLayout($view, annotations, {page, fit})
  }, [annotations, page, fit]);

  useImperativeHandle(ref, () => handleRef.current!, [annotations, page, fit]);

  return <div
    ref={containerRef}
    className="diplomatic-view"
    style={style}
  />;
});