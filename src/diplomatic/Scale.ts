import {Point} from "./Point";

type ScaleFn = (toScale: number) => number;

export type Scale = ScaleFn & {
  factor: number
  point: (toScale: Point) => Point
  path: (toScale: Point[]) => Point[]
}

export function createScale(factor: number): Scale {
  const fn = (num: number) => num * factor;
  const point = (point: Point): Point => [fn(point[0]), fn(point[1])];
  const path = (path: Point[]): Point[] => path.map(point);
  return Object.assign(fn, {factor, point, path})
}