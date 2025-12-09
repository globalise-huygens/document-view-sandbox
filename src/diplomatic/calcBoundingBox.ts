import { Point } from "./point";

/**
 * find the x and y bounds from a set of points
 */
export const calcBoundingBox = (points: Point[]) => {
  let max_x = null;
  let min_x = null;
  let max_y = null;
  let min_y = null;

  points.forEach((p) => {
    const x = p[0];
    const y = p[1];

    max_x = x > max_x ? x : max_x;
    max_y = y > max_y ? y : max_y;

    min_x = min_x === null || x < min_x ? x : min_x;
    min_y = min_y === null || y < min_y ? y : min_y;
  });

  return {
    x: min_x,
    y: min_y,
    x2: max_x,
    y2: max_y,
    width: max_x - min_x,
    height: max_y - min_y,
  };
};
