import { Point } from './Point';

export const calcRadians = (a: Point, b: Point) =>
  Math.atan2(b[1] - a[1], b[0] - a[0]);
