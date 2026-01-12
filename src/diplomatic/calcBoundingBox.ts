import { Point } from './Point';
import { Rect } from './Rect';

type BoundingPoints = [Point, Point, Point, Point];

export function calcBoundingPoints(points: Point[]): BoundingPoints {
  const { xMin, yMin, xMax, yMax } = calcMinMax(points);

  return [
    [xMin, yMin],
    [xMax, yMin],
    [xMax, yMax],
    [xMin, yMax],
  ];
}

export function padBoundingPoints(
  points: BoundingPoints,
  padding: Point,
): BoundingPoints {
  const { xMin, yMin, xMax, yMax } = calcMinMax(points);
  const [paddingX, paddingY] = padding;
  const paddedXMin = xMin - paddingX;
  const paddedYMin = yMin - paddingY;
  const paddedXMax = xMax + paddingX;
  const paddedYMax = yMax + paddingY;

  return [
    [paddedXMin, paddedYMin],
    [paddedXMax, paddedYMin],
    [paddedXMax, paddedYMax],
    [paddedXMin, paddedYMax],
  ];
}

/**
 * find the x and y bounds from a set of points
 */
export const calcBoundingBox = (points: Point[]): Rect => {
  const { xMin, yMin, xMax, yMax } = calcMinMax(points);

  return {
    top: yMin,
    left: xMin,
    width: xMax - xMin,
    height: yMax - yMin,
  };
};

function calcMinMax(points: Point[]) {
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
  return { xMin, yMin, xMax, yMax };
}
