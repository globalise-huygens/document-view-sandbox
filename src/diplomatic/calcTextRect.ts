import {Point} from "./Point";
import {TextHull} from "./TextHull";

export type Rect = {
  left: number;
  top: number;
  width: number;
  height: number;
};

/**
 * Bounding rectangle that fits all text
 */
export function calcTextRect(texts: TextHull[]): Rect {
  if (!texts.length) {
    return {left: 0, top: 0, width: 0, height: 0};
  }

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const word of texts) {
    for (const [x, y] of word.hull) {
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