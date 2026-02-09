import React, {forwardRef, useImperativeHandle, useRef,} from 'react';
import {Id} from "../Id";
import {Annotation} from "../AnnoModel";
import {OriginalLayoutConfig} from "../renderOriginalLayout";

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
>(function OriginalLayout({annotations, config, style}, ref) {
  const containerRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<NormalizedLayoutRefResult | null>(null);

  useImperativeHandle(ref, () => handleRef.current!, [annotations, config]);

  return <div
    ref={containerRef}
    className="normalized-view"
    style={style}
  />;
});