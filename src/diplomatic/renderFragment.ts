import { Point } from './Point';
import { calcBoundingBox } from './calcBoundingBox';
import { px } from './px';

export const renderFragment = (
  text: string,
  hull: Point[],
  angle: number,
  $text: HTMLElement,
): HTMLDivElement => {
  // TODO: first, rotate all points and then calculate the box
  const boundingBox = calcBoundingBox(hull);
  const $boundingBox = document.createElement('div');
  $text.appendChild($boundingBox);
  $boundingBox.style.position = 'absolute';
  $boundingBox.style.left = px(boundingBox.left);
  $boundingBox.style.top = px(boundingBox.top);
  $boundingBox.style.width = px(boundingBox.width);
  $boundingBox.style.height = px(boundingBox.height);
  $boundingBox.style.transform = `rotate(${angle}rad)`;

  const $fragmentText = document.createElement('div');
  $fragmentText.classList.add('fragment');
  $boundingBox.appendChild($fragmentText);
  $fragmentText.innerText = text;
  return $fragmentText;
};
