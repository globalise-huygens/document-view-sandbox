import {Point} from "./Point";
import {calcRadius} from "./calcRadius";
import {calcBoundingBox} from "./calcBoundingBox";
import {findHighestSegments} from "./findHighestSegments";
import {polygonHull} from "d3-polygon";

export type Word = {
  el: HTMLDivElement,
  hull: Point[],
  segment: Point[]
}

export const renderWord = (
  text: string,
  coords: string,
  $text: HTMLElement,
  scale: number,
): Word => {
  const coordarr: Point[] = [];
  for (const pair of coords.split(" ")) {
    const p = pair.split(",");
    coordarr.push([parseInt(p[0]), parseInt(p[1])]);
  }

  const hull = polygonHull(coordarr);

  // get the two segments that connect the 'highest' (lowest) point
  const segment = findHighestSegments(hull);

  // calculate the angles of the segments and select the 'smallest'
  // TODO: is this indeed the best segment?

  const seg_rad1 = calcRadius(segment[0], segment[1]);
  const seg_rad2 = calcRadius(segment[1], segment[2]);
  const seg_rad = Math.abs(seg_rad1) < Math.abs(seg_rad2) ? seg_rad1 : seg_rad2;

  // TODO: first, rotate all points and then caclulate the box

  const boundingBox = calcBoundingBox(hull);
  const $boundingBox = document.createElement("div");
  $text.appendChild($boundingBox);
  $boundingBox.style.position = "absolute";
  $boundingBox.style.left = boundingBox.x * scale + "px";
  $boundingBox.style.top = boundingBox.y * scale + "px";
  $boundingBox.style.width = boundingBox.width * scale + "px";
  $boundingBox.style.height = boundingBox.height * scale + "px";
  $boundingBox.style.transform = "rotate(" + seg_rad + "rad)";

  const $wordText = document.createElement("div");
  $boundingBox.appendChild($wordText);
  $wordText.innerText = text;
  $wordText.style.fontFamily = "monospace";
  $wordText.style.whiteSpace = "nowrap";
  $wordText.style.display = "block";
  $wordText.style.fontSize = "8px";
  return {el: $wordText, hull, segment};
};

