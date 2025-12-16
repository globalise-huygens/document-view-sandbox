import { Word } from './renderWord';

export type Margin = {
  left: number;
  top: number;
};

export function calcMargin(words: Word[], scale: number): Margin {
  if (!words.length) {
    return { left: 0, top: 0 };
  }
  let minX = Infinity;
  let minY = Infinity;
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
