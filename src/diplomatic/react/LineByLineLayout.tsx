import React, {
  forwardRef,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
} from 'react';
import type {Annotation} from '../AnnoModel';
import type {Id} from '../Id';
import type {View} from '../View';
import {renderLineByLineView} from "../../normalized/renderLineByLineView";
import {ViewRef} from "./ViewRef";

export type LineByLineLayoutProps = {
  annotations: Record<Id, Annotation>;
  style?: React.CSSProperties;
  visible?: boolean;
};

export const LineByLineLayout = forwardRef<
  ViewRef,
  LineByLineLayoutProps
>(function LineByLineLayout({annotations, style, visible = true}, ref) {
  const containerRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<ViewRef | null>(null);

  useLayoutEffect(() => {
    const $view = containerRef.current;
    if (!$view) return;

    $view.innerHTML = '';
    handleRef.current = renderLineByLineView({$view, annotations});
  }, [annotations]);

  useLayoutEffect(() => {
    const $view = containerRef.current;
    if (!$view) return;
    $view.style.visibility = visible ? 'visible' : 'hidden';
  }, [visible]);

  useImperativeHandle(ref, () => handleRef.current!, [annotations]);

  return <div
    ref={containerRef}
    style={style}
  />;
});