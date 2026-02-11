import React, {
  forwardRef, Ref,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
} from 'react';
import type {Annotation} from '../AnnoModel';
import type {Id} from '../Id';
import type {Scale} from '../Scale';
import {
  OriginalLayoutResult,
  renderOriginalLayout,
} from '../renderOriginalLayout';
import {ViewFit} from "../calcScaleFactor";
import {createFragment} from "../createFragment";

export type OriginalLayoutProps = {
  annotations: Record<Id, Annotation>;
  page: { width: number; height: number };
  fit?: ViewFit;
  style?: React.CSSProperties;
  ref?: Ref<OriginalLayoutResult>;
};

export function OriginalLayout(
  {annotations, style, page, fit, ref}: OriginalLayoutProps
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<OriginalLayoutResult>(null);

  useLayoutEffect(() => {
    const $view = containerRef.current;
    if (!$view) {
      return;
    }
    $view.innerHTML = '';
    const wordAnnos = Object.values(annotations)
      .filter(a => a.textGranularity === 'word')
    const fragments = wordAnnos.map(createFragment)
    handleRef.current = renderOriginalLayout($view, fragments, {page, fit})
  }, [annotations, page, fit]);

  useImperativeHandle(ref, () => handleRef.current!, [annotations, page, fit]);

  return <div
    ref={containerRef}
    className="original-layout"
    style={style}
  />;
}
