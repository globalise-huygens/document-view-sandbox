import {Word} from './renderWord';

export type Rect = {
  left: number;
  top: number;
  width: number;
  height: number;
};

export function calcScanlessRect(
  words: Word[],
  $text: HTMLElement
): Rect {
  if (!words.length) {
    return {left: 0, top: 0, width: 0, height: 0};
  }

  // Determine the outermost words:
  let minX = Infinity;
  let minXWord: null | Word = null

  let minY = Infinity;
  let minYWord: null | Word = null

  let maxX = -Infinity;
  let maxXWord: null | Word = null

  let maxY = -Infinity;
  let maxYWord: null | Word = null

  for (const word of words) {
    for (const point of word.hull) {
      const [x, y] = point;
      if (x < minX) {
        minX = x
        minXWord = word
      }
      if (y < minY) {
        minY = y
        minYWord = word
      }
      if (x > maxX) {
        maxX = x
        maxXWord = word
      }
      if (y > maxY) {
        maxY = y
        maxYWord = word
      }
    }
  }

  // Determine actual margins and dimensions using the rotated and scaled DOM elements:
  const wordLeft = minXWord?.el.getBoundingClientRect().left || 0
  const wordTop = minYWord?.el.getBoundingClientRect().top || 0
  const wordRight = maxXWord?.el.getBoundingClientRect().right || 0
  const wordBottom = maxYWord?.el.getBoundingClientRect().bottom || 0

  const {left: textLeft, top: textTop} = $text.getBoundingClientRect()
  const relativeTop = wordTop - textTop;
  const relativeLeft = wordLeft - textLeft;
  const width = wordRight - wordLeft;
  const height = wordBottom - wordTop;

  return {
    left: relativeLeft,
    top: relativeTop,
    width,
    height,
  };
}
