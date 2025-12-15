import {D3Svg} from "./index";
import {Point} from "./Point";
import {Word} from "./renderWord";
import {curveLinearClosed, line} from "d3-shape";
import {orThrow} from "../util/orThrow";

export function renderWordBoundaries(
  word: Word,
  $boundaries: D3Svg,
  scale: number,
) {
  const parent = word.el.parentElement ??orThrow('No parent')
  parent.classList.add('bounding-box')

  const scaledHull: Point[] = word.hull.map((p) => [p[0] * scale, p[1] * scale]);
  const scaledSeg: Point[] = word.base.map((p) => [p[0] * scale, p[1] * scale]);
  const curve = line<Point>().curve(curveLinearClosed);

  $boundaries
    .append("path")
    .attr("d", curve(scaledHull))
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