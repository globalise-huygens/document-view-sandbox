import {Annotation} from "./AnnoModel";
import {D3El} from "./D3El";
import {Point} from "./Point";
import {createBlockBoundaries} from "./createBlockBoundaries";
import {calcBoundingCorners, padCorners} from "./calcBoundingBox";
import {createPath} from "./createPath";

type BlocksConfig = {
  factor: number
}

export function renderBlocks(
  annotations: Record<string, Annotation>,
  $highlights: D3El<SVGSVGElement>,
  {factor}: BlocksConfig
) {
  const scale = (toScale: number) => toScale * factor;
  const scalePoint = (p: Point): Point => [scale(p[0]), scale(p[1])];
  const words = Object.values(annotations)
    .filter(a => a.textGranularity === 'word')
  const blockBoundaries = createBlockBoundaries(words, annotations);
  const padding: Point = [50, 100];
  const blockCorners = Object.fromEntries(
    Object.entries(blockBoundaries).map(([id, block]) => {
      const corners = calcBoundingCorners(block);
      const padded = padCorners(corners, padding);
      const scaled = padded.map(scalePoint);
      return [id, scaled];
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