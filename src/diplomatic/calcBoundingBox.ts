import { Point } from "./Point";

/**
 * find the x and y bounds from a set of points
 */
export const calcBoundingBox = (points: Point[]) => {
  let xMin = points[0][0];
  let yMin = points[0][1];
  let xMax = points[0][0];
  let yMax = points[0][1];

  for (let i = 1; i < points.length; i++) {
    const x = points[i][0];
    const y = points[i][1];
    xMin = Math.min(xMin, x);
    xMax = Math.max(xMax, x);
    yMin = Math.min(yMin, y);
    yMax = Math.max(yMax, y);
  }

  return {
    x: xMin,
    y: yMin,
    width: xMax - xMin,
    height: yMax - yMin,
  };
};
