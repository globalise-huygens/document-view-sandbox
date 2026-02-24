import {Annotation, findSourceLabel} from '@globalise/annotation';
import {Point} from '@knaw-huc/original-layout';
import {calcBoundingCorners, padCorners} from '@knaw-huc/original-layout';
import {createPath} from '@knaw-huc/original-layout';
import {Scale} from '@knaw-huc/original-layout';
import {select} from 'd3-selection';
import {px} from '@knaw-huc/original-layout';
import {D3El} from '@knaw-huc/original-layout';
import {createBlockBoundaries} from './createBlockBoundaries.ts';
import {Offset} from '@knaw-huc/original-layout';

type BlocksConfig = {
  scale: Scale;
  offset: Offset;
  fill?: string;
  stroke?: string;
};

export function renderBlocks(
  annotations: Record<string, Annotation>,
  $view: HTMLElement,
  {
    scale,
    offset,
    stroke = 'rgba(0,200,0,1)',
    fill = 'rgba(0,255,0,0.05)',
  }: BlocksConfig,
) {
  const {width, height} = $view.getBoundingClientRect();
  const $svg = select($view)
    .append('svg')
    .attr('class', 'blocks')
    .style('margin-top', px(offset.top))
    .style('margin-left', px(offset.left))
    .attr('width', width - offset.left)
    .attr('height', height - offset.top);

  const words = Object.values(annotations).filter(
    (a) => a.textGranularity === 'word',
  );
  const blocks = Object.fromEntries(
    Object.entries(annotations).filter(([, a]) => a.textGranularity === 'block'),
  );

  const blockBoundaries = createBlockBoundaries(words, annotations);
  const padding: Point = [50, 100];
  const blockCorners = Object.fromEntries(
    Object.entries(blockBoundaries).map(([id, block]) => {
      const corners = calcBoundingCorners(block);
      const padded = scale.path(padCorners(corners, padding));
      return [id, padded];
    }),
  );
  const $blocks: Record<string, D3El<SVGGElement>> = Object.fromEntries(
    Object.entries(blockCorners).map(([id, corners]) => {
      const block = blocks[id];
      const label = findSourceLabel(block);
      const $highlight = $svg.append('g').attr('opacity', 0);

      $highlight
        .append('polygon')
        .attr('points', createPath(corners))
        .attr('fill', fill)
        .attr('stroke', stroke);

      const blockTopLeft = corners[0];
      $highlight
        .append('text')
        .attr('class', 'block-label')
        .attr('dominant-baseline', 'hanging')
        .attr('x', blockTopLeft[0] + scale(30))
        .attr('y', blockTopLeft[1] + scale(30))
        .style('font-size', px(scale(60)))
        .attr('fill', stroke)
        .text(label);
      return [id, $highlight];
    }),
  );

  return {$blocks};
}