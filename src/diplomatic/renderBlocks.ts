import { Annotation, isBlockWithLabel } from './AnnoModel';
import { Point } from './Point';
import { createBlockBoundaries } from './createBlockBoundaries';
import { calcBoundingCorners, padCorners } from './calcBoundingBox';
import { createPath } from './createPath';
import { Scale } from './Scale';
import { select } from 'd3-selection';
import { px } from './px';
import { pickBy } from 'lodash';
import {Id} from "./Id";

type BlocksConfig = { scale: Scale; fill?: string; stroke?: string };

export function renderBlocks(
  annotations: Record<string, Annotation>,
  $overlay: SVGSVGElement,
  {
    scale,
    stroke = 'rgba(0,200,0,1)',
    fill = 'rgba(0,255,0,0.05)',
  }: BlocksConfig,
) {
  const $svg = select($overlay);
  const words = Object.values(annotations).filter(
    (a) => a.textGranularity === 'word',
  );
  const blocks = pickBy(annotations, (a) => a.textGranularity === 'block');

  const blockBoundaries = createBlockBoundaries(words, annotations);
  const padding: Point = [50, 100];
  const blockCorners = Object.fromEntries(
    Object.entries(blockBoundaries).map(([id, block]) => {
      const corners = calcBoundingCorners(block);
      const padded = scale.path(padCorners(corners, padding));
      return [id, padded];
    }),
  );
  const $blockHighlights = Object.fromEntries(
    Object.entries(blockCorners).map(([id, corners]) => {
      const block = blocks[id];
      const body = Array.isArray(block.body) ? block.body[0] : block.body;

      const label = isBlockWithLabel(body) ? body.source.label : 'no label';
      const $highlight = $svg.append('g').attr('visibility', 'hidden');

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

  /**
   * Prevent flickering
   */
  const timedBlockHides: Map<Id, number> = new Map();

  function showBlock(blockId: Id) {
    const existingTimeout = timedBlockHides.get(blockId);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
      timedBlockHides.delete(blockId);
    }
    $blockHighlights[blockId].attr('visibility', 'visible');
  }

  function hideBlock(blockId: Id) {
    const timeoutId = window.setTimeout(() => {
      $blockHighlights[blockId].attr('visibility', 'hidden');
      timedBlockHides.delete(blockId);
    }, 150);
    timedBlockHides.set(blockId, timeoutId);
  }

  return {showBlock, hideBlock};
}
