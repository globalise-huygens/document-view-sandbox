export function createPath(points: [number, number][]) {
  return points
    .map(p => `${p[0]},${p[1]}`)
    .join(' ');
}