import {D3Svg} from "./index";
import {Point} from "./Point";
import {Word} from "./renderWord";
import {curveLinearClosed, line} from "d3-shape";

export function renderWordBoundaries(
  word: Word,
  $boundaries: D3Svg,
  scale: number,
) {
  word.el.parentElement.classList.add('bounding-box')

  const scaledHull = word.hull.map((p) => [p[0] * scale, p[1] * scale]);
  const scaledSeg = word.segment.map((p) => [p[0] * scale, p[1] * scale]);
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
}