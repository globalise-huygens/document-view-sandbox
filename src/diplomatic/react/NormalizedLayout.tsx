import React, {Ref, useImperativeHandle, useLayoutEffect, useRef,} from 'react';
import {Id} from "../anno/Id";
import {Annotation} from "../anno/AnnoModel";
import {
  NormalizedLayoutResult,
  renderNormalizedLayout
} from "../../normalized/renderNormalizedLayout";

export type NormalizedLayoutProps = {
  annotations: Record<Id, Annotation>;
  style?: React.CSSProperties;
  ref?: Ref<NormalizedLayoutResult>;
};

export function NormalizedLayout(
  {annotations, style, ref}: NormalizedLayoutProps
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<NormalizedLayoutResult>(null);

  useLayoutEffect(() => {
    const $view = containerRef.current;
    if (!$view) {
      return;
    }

    $view.innerHTML = '';
    handleRef.current = renderNormalizedLayout($view, annotations);
  }, [annotations]);

  useImperativeHandle(ref, () => handleRef.current!, [annotations]);

  return <div
    ref={containerRef}
    className="normalized-view"
    style={style}
  />;
}
