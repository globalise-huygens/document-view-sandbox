import React, {
  forwardRef,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
} from 'react';
import {Id} from "../Id";
import {Annotation} from "../AnnoModel";
import {renderNormalizedLayout} from "../../normalized/renderNormalizedLayout";

export type NormalizedLayoutProps = {
  annotations: Record<Id, Annotation>;
  style?: React.CSSProperties;
};

export type NormalizedLayoutRefResult = {
  $words: Record<Id, HTMLElement>;
  $overlay: SVGSVGElement;
};

export const NormalizedLayout = forwardRef<
  NormalizedLayoutRefResult,
  NormalizedLayoutProps
>(function NormalizedLayout({annotations, style}, ref) {
  const containerRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<NormalizedLayoutRefResult>(null);

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
});