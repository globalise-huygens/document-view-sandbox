import {select} from "d3-selection";
import {Annotation} from "../diplomatic/AnnoModel";
import {Id} from "../diplomatic/Id";
import {findResourceTarget} from "../diplomatic/findResourceTarget";
import {createPoints} from "../diplomatic/createPoints";
import {calcBoundingBox} from "../diplomatic/calcBoundingBox";
import {D3El} from "../diplomatic/D3El";

type BlocksConfig = {
  stroke: string
}

export function renderBlocks(
  $lines: Record<Id, HTMLElement>,
  $overlay: SVGSVGElement,
  annotations: Record<Id, Annotation>,
  {stroke}: BlocksConfig
) {
  const $d3Overlay = select($overlay);

  const blockWithLines: Record<Id, Id[]> = {};
  for (const lineId of Object.keys($lines)) {
    const line = annotations[lineId];
    const block = findResourceTarget(line);
    if (!blockWithLines[block.id]) {
      blockWithLines[block.id] = [];
    }
    blockWithLines[block.id].push(lineId);
  }

  const overlayOffset = $overlay.getBoundingClientRect().top;

  const $blocks: Record<Id, D3El<SVGLineElement>> = {}
  for (const [blockId, lineIds] of Object.entries(blockWithLines)) {
    const $blockLines = lineIds.map(l => $lines[l]);
    const lineBoundingPoints = $blockLines.flatMap($line =>
      createPoints($line.getBoundingClientRect())
    );
    const blockBbox = calcBoundingBox(lineBoundingPoints);

    const scaleFactor = $overlay.getBoundingClientRect().width / 1000
    const strokeWidth = Math.ceil(5 * scaleFactor)

    $blocks[blockId] = $d3Overlay
      .append("line")
      .attr("x1", 0)
      .attr("y1", blockBbox.top - overlayOffset)
      .attr("x2", 0)
      .attr("y2", blockBbox.top + blockBbox.height - overlayOffset)
      .attr("stroke", stroke)
      .attr("stroke-width", strokeWidth)
      .attr("opacity", 0)
  }
  return {$blocks};
}
