import {Point} from "./Point";
import {polygonHull} from "d3-polygon";
import {orThrow} from "../util/orThrow";
import {createPoints} from "./createPoints";

export function createHull(coords: string): Point[] {
  const points = createPoints(coords);
  return polygonHull(points) ?? orThrow('No hull');
}