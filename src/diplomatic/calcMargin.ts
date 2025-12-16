import {Word} from './renderWord';

export type Margin = {
  left: number;
  top: number;
};

export function calcMargin(
  words: Word[],
  $text: HTMLElement
): Margin {
  if (!words.length) {
    return {left: 0, top: 0};
  }

  // Determine the top and left most words:
  let minX = Infinity;
  let xWord: null | Word = null
  let minY = Infinity;
  let yWord: null | Word = null
  for (const word of words) {
    for (const point of word.hull) {
      const [x, y] = point;
      if (x < minX) {
        minX = x
        xWord = word
      }
      if (y < minY) {
        minY = y
        yWord = word
      }
    }
  }

  // Determine actual margins using the rotated and scaled DOM elements:
  const wordLeft = xWord?.el.getBoundingClientRect().left || 0
  const wordTop = yWord?.el.getBoundingClientRect().top || 0
  const {left: textLeft, top: textTop} = $text.getBoundingClientRect()
  const relativeTop = wordTop - textTop;
  const relativeLeft = wordLeft - textLeft;

  return {
    left: relativeLeft,
    top: relativeTop,
  };
}
