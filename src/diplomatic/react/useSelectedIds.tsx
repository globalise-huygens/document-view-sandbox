import {RefObject, useLayoutEffect, useRef} from 'react';
import {View} from "@knaw-huc/original-layout";
import {Id} from "@knaw-huc/original-layout";

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