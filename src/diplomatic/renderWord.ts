import {Point} from "./Point";
import {calcBoundingBox} from "./calcBoundingBox";
import {calcBaseSegment} from "./calcBaseSegment";
import {polygonHull} from "d3-polygon";
import {calcTextAngle} from "./calcTextAngle";
import {orThrow} from "../util/orThrow";

export type Word = {
  el: HTMLDivElement,
  hull: Point[],
  base: Point[]
}

export const renderWord = (
  text: string,
  coords: string,
  $text: HTMLElement,
  scale: number,
): Word => {
  const points: Point[] = [];
  for (const pair of coords.split(" ")) {
    const p = pair.split(",");
    points.push([parseInt(p[0]), parseInt(p[1])]);
  }

  const hull = polygonHull(points) ?? orThrow('No hull');
  const base = calcBaseSegment(hull);
  const angle = calcTextAngle(base);

  // TODO: first, rotate all points and then calculate the box
  const boundingBox = calcBoundingBox(hull);
  const $boundingBox = document.createElement("div");
  $text.appendChild($boundingBox);
  $boundingBox.style.position = "absolute";
  $boundingBox.style.left = boundingBox.x * scale + "px";
  $boundingBox.style.top = boundingBox.y * scale + "px";
  $boundingBox.style.width = boundingBox.width * scale + "px";
  $boundingBox.style.height = boundingBox.height * scale + "px";
  $boundingBox.style.transform = "rotate(" + angle + "rad)";

  const $wordText = document.createElement("div");
  $wordText.classList.add('word')
  $boundingBox.appendChild($wordText);
  $wordText.innerText = text;
  return {el: $wordText, hull, base};
};

