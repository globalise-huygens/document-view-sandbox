import { Point } from "./point";

export const calcRadius = (a: Point, b: Point) =>
  Math.atan2(b[1] - a[1], b[0] - a[0]);
