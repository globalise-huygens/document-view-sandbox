import React, {
  forwardRef,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
} from 'react';
import type {Annotation} from '../AnnoModel';
import type {Id} from '../Id';
import type {View} from '../View';
import {
  DiplomaticViewConfig,
  renderDiplomaticView,
} from '../renderDiplomaticView';

export type DiplomaticViewProps = {
  annotations: Record<Id, Annotation>;
  config: DiplomaticViewConfig;
  style?: React.CSSProperties;
};

export const DiplomaticView = forwardRef<
  View,
  DiplomaticViewProps
>(function DiplomaticView({ annotations, config, style }, ref) {
  const containerRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<View | null>(null);

  useLayoutEffect(() => {
    const $view = containerRef.current;
    if (!$view) {
      return;
    }

    $view.innerHTML = '';
    handleRef.current = renderDiplomaticView($view, annotations, config);
  }, [annotations, config]);

  useImperativeHandle(ref, () => handleRef.current!, [annotations, config]);

  return <div
    ref={containerRef}
    style={style}
  />;
});