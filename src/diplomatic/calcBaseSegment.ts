import { Point } from "./Point";

/**
 * Find the three lowest points forming the baseline of a 'convex hull'
 * where 'lowest' point on the screen is the point with the highest y-value.
 */
export function calcBaseSegment(points: Point[]) {
  const segment: Point[] = new Array(3);

  // Find the highest point:
  let highest: Point = [0, 0];
  let highestIndex: number | null = null;
  points.forEach((p, i) => {
    if (p[1] > highest[1]) {
      highest = p;
      highestIndex = i;
    }
  });
  segment[1] = highest

  // Add the previous point:
  if (highestIndex > 0) {
    segment[0] = points[highestIndex - 1];
  } else {
    segment[0] = points[points.length - 1];
  }

  // Add the next point:
  if (points.length > highestIndex + 1) {
    segment[2] = points[highestIndex + 1];
  } else {
    segment[2] = points[0];
  }

  return segment;
}
