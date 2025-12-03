import {Point} from "./point";

export function findHighestSegments(points: Point[]) {
  const segments: Point[] = [];

  let highest: Point = [0, 0];
  let highest_index: number | null = null;

  points.forEach((p, i) => {
    if (p[1] > highest[1]) {
      highest = p;
      highest_index = i;
    }
  });

  // add the previous point. add the last if it's not there

  if (highest_index > 0) {
    segments.push(points[highest_index - 1]);
  } else {
    segments.push(points[points.length - 1]);
  }

  // add the highest point

  segments.push(highest);

  // if the next point is beyond the length, add the first point

  if (points.length > highest_index + 1) {
    segments.push(points[highest_index + 1]);
  } else {
    segments.push(points[0]);
  }

  return segments;
}