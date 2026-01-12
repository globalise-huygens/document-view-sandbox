import { Point } from './Point';
import { curveLinearClosed, line } from 'd3-shape';
import { orThrow } from '../util/orThrow';
import {$D3} from "./$D3";

export function renderWordBoundaries(
  el: HTMLElement,
  hull: Point[],
  base: Point[],
  $boundaries: $D3<SVGSVGElement>,
) {
  const parent = el.parentElement ?? orThrow('No parent');
  parent.classList.add('bounding-box');

  const curve = line<Point>().curve(curveLinearClosed);

  $boundaries
    .append('path')
    .attr('d', curve(hull))
    .attr('stroke', 'black')
    .attr('fill', 'white')
    .attr('stroke-width', 1);

  const lines = line();

  $boundaries
    .append('path')
    .attr('d', lines(base))
    .attr('stroke', 'red')
    .attr('fill', 'white')
    .attr('stroke-width', 1);
}
