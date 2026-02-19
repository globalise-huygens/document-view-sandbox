import { useLayoutEffect, RefObject } from 'react';

export function useVisibility(
  ref: RefObject<HTMLElement | null>,
  visible: boolean,
) {
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) {
      return;
    }
    el.style.visibility = visible ? 'visible' : 'hidden';
  }, [visible]);
}