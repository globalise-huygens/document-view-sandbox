import {Word} from "./renderWord";

export type Margin = {
  left: number;
  top: number;
};

export function calcMargin(
  words: Word[],
  scale: number
): Margin {
  if (!words.length) {
    return {left: 0, top: 0};
  }
  const firstHull = words[0].hull;
  let minX = firstHull[0][0];
  let minY = firstHull[0][0];
  for (const word of words) {
    for (const point of word.hull) {
      const [x, y] = point;
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
    }
  }
  return {
    left: Math.round(minX * scale),
    top: Math.round(minY * scale),
  };
}