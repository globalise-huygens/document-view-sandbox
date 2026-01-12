import { Point } from './Point';

export function createPoints(coords: string) {
  const points: Point[] = [];
  for (const pair of coords.split(' ')) {
    const p = pair.split(',');
    points.push([parseInt(p[0]), parseInt(p[1])]);
  }
  return points;
}
