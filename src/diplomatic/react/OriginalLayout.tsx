import React, {
  forwardRef,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
} from 'react';
import type {Annotation} from '../AnnoModel';
import type {Id} from '../Id';
import type {Scale} from '../Scale';
import {
  OriginalLayoutConfig,
  renderOriginalLayout,
} from '../renderOriginalLayout';

export type OriginalLayoutProps = {
  annotations: Record<Id, Annotation>;
  config: OriginalLayoutConfig;
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
>(function OriginalLayout({annotations, config, style}, ref) {
  const containerRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<OriginalLayoutRefResult | null>(null);

  useLayoutEffect(() => {
    const $view = containerRef.current;
    if (!$view) {
      return;
    }

    $view.innerHTML = '';
    handleRef.current = renderOriginalLayout($view, annotations, config);
  }, [annotations, config]);

  useImperativeHandle(ref, () => handleRef.current!, [annotations, config]);

  return <div
    ref={containerRef}
    className="diplomatic-view"
    style={style}
  />;
});