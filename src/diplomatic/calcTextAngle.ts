import {Point} from "./Point";
import {calcRadians} from "./calcRadians";

/**
 * Determine the text angle from a segment of three points
 * 1. Calculate the angle of each line meeting at the middle point of the baseline segment
 * 2. Select the segment with the smallest absolute angle
 *
 * Note: this assumes the baseline text written horizontally, may fail for steep angles
 *
 * TODO: is this indeed the best segment?
 *   - possible solution: validate by comparing bounding box aspect ratio to text length
 */
export function calcTextAngle(segment: Point[]) {
  const angle01 = calcRadians(segment[0], segment[1]);
  const angle12 = calcRadians(segment[1], segment[2]);

  const lowestAngle = Math.abs(angle01) < Math.abs(angle12)
    ? angle01
    : angle12;
  return lowestAngle;
}