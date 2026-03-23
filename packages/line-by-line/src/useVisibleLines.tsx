import {useState, useEffect, RefObject} from 'react';
import {Id} from '@globalise/common/annotation';

/**
 * Track elements with a data-line-id attribute, see also {@link SegmentedLine}
 */
export function useVisibleLines(
  textRef: RefObject<HTMLDivElement | null>
): Set<Id> {
  const [visibleLines, setVisibleLines] = useState<Set<Id>>(new Set());

  useEffect(() => {
    const text = textRef.current;
    if (!text) {
      return;
    }

    const intersections = new IntersectionObserver((events) => {
        setVisibleLines(prev => {
          const next = new Set(prev);
          for (const event of events) {
            const line = event.target;
            if (!(line instanceof HTMLElement)) {
              continue;
            }
            const lineId = line.dataset.lineId;
            if (!lineId) {
              continue;
            }
            if (event.isIntersecting) {
              next.add(lineId);
            } else {
              next.delete(lineId);
            }
          }
          return next;
        });
      }, {root: text, threshold: 0}
    );

    const lines = text.querySelectorAll('[data-line-id]');
    lines.forEach(line => intersections.observe(line));

    return () => intersections.disconnect();
  });

  return visibleLines;
}