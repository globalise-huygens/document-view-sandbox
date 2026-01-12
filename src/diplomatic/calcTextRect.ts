import { Point } from './Point';
import { Rect } from './Rect';

/**
 * Bounding rectangle that fits all text
 */
export function calcTextRect(texts: { hull: Point[] }[]): Rect {
  if (!texts.length) {
    return { left: 0, top: 0, width: 0, height: 0 };
  }

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const hull of texts) {
    for (const [x, y] of hull.hull) {
      if (x < minX) {
        minX = x;
      }
      if (y < minY) {
        minY = y;
      }
      if (x > maxX) {
        maxX = x;
      }
      if (y > maxY) {
        maxY = y;
      }
    }
  }

  return {
    left: minX,
    top: minY,
    width: maxX - minX,
    height: maxY - minY,
  };
}
