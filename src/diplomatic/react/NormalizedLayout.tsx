import React, {
  forwardRef,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
} from 'react';
import {Id} from "../Id";
import {Annotation} from "../AnnoModel";
import {OriginalLayoutConfig} from "../renderOriginalLayout";
import {renderLineByLineView} from "../../normalized/renderLineByLineView";
import {renderNormalizedLayout} from "../../normalized/renderNormalizedLayout";

export type OriginalLayoutProps = {
  annotations: Record<Id, Annotation>;
  config: OriginalLayoutConfig;
  style?: React.CSSProperties;
};

export type NormalizedLayoutRefResult = {
  $words: Record<Id, HTMLElement>;
  $overlay: SVGSVGElement;
};

export const NormalizedLayout = forwardRef<
  NormalizedLayoutRefResult,
  OriginalLayoutProps
>(function NormalizedLayout({annotations, config, style}, ref) {
  const containerRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<NormalizedLayoutRefResult | null>(null);

  useLayoutEffect(() => {
    const $view = containerRef.current;
    if (!$view) {
      return;
    }

    $view.innerHTML = '';
    handleRef.current = renderNormalizedLayout($view, annotations);
  }, [annotations, config]);

  useImperativeHandle(ref, () => handleRef.current!, [annotations, config]);

  return <div
    ref={containerRef}
    className="normalized-view"
    style={style}
  />;
});