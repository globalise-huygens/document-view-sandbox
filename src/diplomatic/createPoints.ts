import { Point } from './Point';

export function createPoints(
  coordinates: string | DOMRect
) {
  if(typeof coordinates === 'string') {
    return createPointsFromSvgPath(coordinates);
  } else {
    return createPointsFromDomRect(coordinates);
  }
}

function createPointsFromSvgPath(coords: string) {
  const points: Point[] = [];
  for (const pair of coords.split(' ')) {
    const p = pair.split(',');
    points.push([parseInt(p[0]), parseInt(p[1])]);
  }
  return points;
}

function createPointsFromDomRect(rect: DOMRect): Point[] {
  return [
    [rect.left, rect.top],
    [rect.right, rect.top],
    [rect.right, rect.bottom],
    [rect.left, rect.bottom],
  ];
}

