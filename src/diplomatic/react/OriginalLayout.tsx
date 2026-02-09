import React, {
  useLayoutEffect,
  useRef,
  useImperativeHandle,
  forwardRef,
} from 'react';
import type { Annotation } from '../AnnoModel';
import type { Id } from '../Id';
import type { Scale } from '../Scale';
import {
  OriginalLayoutConfig,
  renderOriginalLayout,
} from '../renderOriginalLayout';

export type WordInteraction = {
  className?: (id: Id) => string | undefined;
  onMouseEnter?: (id: Id, el: HTMLElement) => void;
  onMouseLeave?: (id: Id, el: HTMLElement) => void;
  onClick?: (id: Id, el: HTMLElement) => void;
};

export type OriginalLayoutProps = {
  annotations: Record<Id, Annotation>;
  config: OriginalLayoutConfig;
  wordInteraction?: WordInteraction;
};

export type OriginalLayoutHandle = {
  scale: Scale;
  $words: Record<Id, HTMLElement>;
  $overlay: SVGSVGElement;
};

export const OriginalLayout = forwardRef<
  OriginalLayoutHandle,
  OriginalLayoutProps
>(function OriginalLayout({ annotations, config, wordInteraction }, ref) {
  const containerRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<OriginalLayoutHandle | null>(null);

  useLayoutEffect(() => {
    const $view = containerRef.current;
    if (!$view) return;

    $view.innerHTML = '';
    const layout = renderOriginalLayout($view, annotations, config);
    const {$words} = layout;
    handleRef.current = layout;

    if (wordInteraction) {
      const { className, onMouseEnter, onMouseLeave, onClick } =
        wordInteraction;
      for (const [id, $word] of Object.entries($words)) {
        if (className) {
          const cls = className(id);
          if (cls) $word.classList.add(...cls.split(' '));
        }
        if (onMouseEnter)
          $word.addEventListener('mouseenter', () => onMouseEnter(id, $word));
        if (onMouseLeave)
          $word.addEventListener('mouseleave', () => onMouseLeave(id, $word));
        if (onClick)
          $word.addEventListener('click', () => onClick(id, $word));
      }
    }
  }, [annotations, config, wordInteraction]);

  useImperativeHandle(ref, () => handleRef.current!, [annotations, config]);

  return <div ref={containerRef} className="diplomatic-view" />;
});