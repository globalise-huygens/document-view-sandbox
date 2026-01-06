import {Point} from "./Point";
import {polygonHull} from "d3-polygon";
import {orThrow} from "../util/orThrow";

export function createHull(coords: string): Point[] {
  const points: Point[] = [];
  for (const pair of coords.split(' ')) {
    const p = pair.split(',');
    points.push([parseInt(p[0]), parseInt(p[1])]);
  }
  return polygonHull(points) ?? orThrow('No hull');
}