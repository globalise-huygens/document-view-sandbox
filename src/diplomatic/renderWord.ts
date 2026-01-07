import {Point} from './Point';
import {calcBoundingBox} from './calcBoundingBox';
import {calcBaseSegment} from './calcBaseSegment';
import {calcTextAngle} from './calcTextAngle';
import {px} from "./px";

import {TextHull} from "./TextHull";

export type Word = TextHull & {
  el: HTMLDivElement;
  base: Point[];
};

export const renderWord = (
  text: string,
  hull: Point[],
  $text: HTMLElement,
  scale: number,
): Word => {
  const base = calcBaseSegment(hull);
  const angle = calcTextAngle(base);

  // TODO: first, rotate all points and then calculate the box
  const boundingBox = calcBoundingBox(hull);
  const $boundingBox = document.createElement('div');
  $text.appendChild($boundingBox);
  $boundingBox.style.position = 'absolute';
  $boundingBox.style.left = px(boundingBox.x * scale);
  $boundingBox.style.top = px(boundingBox.y * scale);
  $boundingBox.style.width = px(boundingBox.width * scale);
  $boundingBox.style.height = px(boundingBox.height * scale);
  $boundingBox.style.transform = `rotate(${angle}rad)`;

  const $wordText = document.createElement('div');
  $wordText.classList.add('word');
  $boundingBox.appendChild($wordText);
  $wordText.innerText = text;
  return { text, el: $wordText, hull, base };
};
