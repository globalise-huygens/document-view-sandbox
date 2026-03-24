import {Annotation, findSourceLabel} from '@globalise/common/annotation';
import {Point} from '@knaw-huc/original-layout';
import {calcBoundingCorners, padCorners} from '@knaw-huc/original-layout';
import {createPath} from '@knaw-huc/original-layout';
import {Scale} from '@knaw-huc/original-layout';
import {select} from 'd3-selection';
import {px} from '@knaw-huc/original-layout';
import {D3El} from '@knaw-huc/original-layout';
import {createBlockBoundaries} from './createBlockBoundaries.ts';
import {Offset} from '@knaw-huc/original-layout';

type BlockColors = {
  text: string;
  stroke: string;
  fill: string;
};

type BlocksConfig = {
  scale: Scale;
  offset: Offset;
  colors?: BlockColors;
};

export function renderBlocks(
  annotations: Record<string, Annotation>,
  $view: HTMLElement,
  {
    scale,
    offset,
    colors = {
      text: 'rgba(0,200,0,1)',
      stroke: 'rgba(0,200,0,0.25)',
      fill: 'rgba(0,255,0,0.01)',
    },
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
        .attr('fill', colors.fill)
        .attr('stroke', colors.stroke);

      const blockTopLeft = corners[0];
      $highlight
        .append('text')
        .attr('class', 'block-label')
        .attr('dominant-baseline', 'hanging')
        .attr('x', blockTopLeft[0] + scale(30))
        .attr('y', blockTopLeft[1] + scale(30))
        .style('font-size', px(scale(60)))
        .attr('fill', colors.text)
        .text(label);
      return [id, $highlight];
    }),
  );

  return {$blocks};
}