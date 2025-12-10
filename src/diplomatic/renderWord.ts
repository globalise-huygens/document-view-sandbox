import { Point } from "./Point";
import { calcRadius } from "./calcRadius";
import { calcBoundingBox } from "./calcBoundingBox";
import { D3Svg } from "./index";
import { findHighestSegments } from "./findHighestSegments";
import { polygonHull } from "d3-polygon";
import { curveLinearClosed, line } from "d3-shape";

export const renderWord = (
  text: string,
  coords: string,
  $text: HTMLElement,
  $boundaries: D3Svg,
  scale: number,
) => {
  const coordarr: Point[] = [];
  for (const pair of coords.split(" ")) {
    const p = pair.split(",");
    coordarr.push([parseInt(p[0]), parseInt(p[1])]);
  }

  const hull = polygonHull(coordarr);

  // get the two segments that connect the 'highest' (lowest) point
  const seg = findHighestSegments(hull);

  // calculate the angles of the segments and select the 'smallest'
  // TODO: is this indeed the best segment?

  const seg_rad1 = calcRadius(seg[0], seg[1]);
  const seg_rad2 = calcRadius(seg[1], seg[2]);
  const seg_rad = Math.abs(seg_rad1) < Math.abs(seg_rad2) ? seg_rad1 : seg_rad2;

  // TODO: first, rotate all points and then caclulate the box

  const boundingBox = calcBoundingBox(hull);
  const $boundingBox = document.createElement("div");
  $text.appendChild($boundingBox);
  $boundingBox.style.position = "absolute";
  $boundingBox.style.border = "dashed 1px blue";
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

  const scaledHull = hull.map((p) => [p[0] * scale, p[1] * scale]);
  const scaledSeg = seg.map((p) => [p[0] * scale, p[1] * scale]);
  const cur = line<Point>().curve(curveLinearClosed);

  $boundaries
    .append("path")
    .attr("d", cur(scaledHull))
    .attr("stroke", "black")
    .attr("fill", "white")
    .attr("stroke-width", 1);

  const lines = line();

  $boundaries
    .append("path")
    .attr("d", lines(scaledSeg))
    .attr("stroke", "red")
    .attr("fill", "white")
    .attr("stroke-width", 1);
  return $wordText;
};
