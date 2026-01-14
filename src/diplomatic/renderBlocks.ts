import {Annotation} from "./AnnoModel";
import {D3El} from "./D3El";
import {Point} from "./Point";
import {createBlockBoundaries} from "./createBlockBoundaries";
import {calcBoundingCorners, padCorners} from "./calcBoundingBox";
import {createPath} from "./createPath";
import {Scale} from "./Scale";

type BlocksConfig = { scale: Scale };

export function renderBlocks(
  annotations: Record<string, Annotation>,
  $highlights: D3El<SVGSVGElement>,
  {scale}: BlocksConfig
) {
  const words = Object.values(annotations)
    .filter(a => a.textGranularity === 'word')
  const blockBoundaries = createBlockBoundaries(words, annotations);
  const padding = scale.point([50, 100]);
  const blockCorners = Object.fromEntries(
    Object.entries(blockBoundaries).map(([id, block]) => {
      const corners = calcBoundingCorners(block);
      const padded = padCorners(corners, padding);
      return [id, padded];
    }),
  );
  const $blockHighlights = Object.fromEntries(
    Object.entries(blockCorners).map(([id, p]) => {
      const $highlight = $highlights
        .append('polygon')
        .attr('points', createPath(p))
        .attr('fill', 'rgba(255,0,255,0.05)')
        .attr('stroke', 'rgba(255,0,255,1)')
        .attr('visibility', 'hidden');
      return [id, $highlight];
    }),
  );
  return $blockHighlights;
}