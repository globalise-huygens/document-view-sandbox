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

export type LineByLineLayoutProps = {
  annotations: Record<Id, Annotation>;
  style?: React.CSSProperties;
};

export const LineByLineLayout = forwardRef<
  View,
  LineByLineLayoutProps
>(function LineByLineLayout({annotations, style}, ref) {
  const containerRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<View | null>(null);

  useLayoutEffect(() => {
    const $view = containerRef.current;
    if (!$view) {
      return;
    }

    $view.innerHTML = '';
    handleRef.current = renderLineByLineView({$view, annotations});
  }, [annotations, annotations]);

  useImperativeHandle(ref, () => handleRef.current!, [annotations]);

  return <div
    ref={containerRef}
    style={style}
  />;
});