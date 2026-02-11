import {RefObject, useLayoutEffect, useRef} from 'react';
import type { Id } from '../anno/Id';
import type { View } from '../View';

export function useSelectedIds(
  viewRef: RefObject<View | null>,
  selected: Id[],
) {
  const prevRef = useRef<Id[]>([]);

  useLayoutEffect(() => {
    const view = viewRef.current;
    if (!view) {
      return;
    }
    prevRef.current.forEach(id => view.deselectAnnotation(id));
    selected.forEach(id => view.selectAnnotation(id));
    prevRef.current = selected;
  }, [selected]);
}