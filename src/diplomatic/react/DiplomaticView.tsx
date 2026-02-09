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
};

export type DiplomaticViewHandle = View;

export const DiplomaticView = forwardRef<
  DiplomaticViewHandle,
  DiplomaticViewProps
>(function DiplomaticView({ annotations, config }, ref) {
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

  return <div ref={containerRef} />;
});