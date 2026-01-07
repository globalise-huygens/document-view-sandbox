import {createPoints} from "./createPoints";

export function scalePath(path: string, scale: number) {
  const points = createPoints(path)
  const scaled = points.map((p) => [p[0] * scale, p[1] * scale]);
  return scaled.map(p => `${p[0]},${p[1]}`).join(' ')
}