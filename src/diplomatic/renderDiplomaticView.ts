import {select} from 'd3-selection';
import {AnnotationPage} from './AnnoModel';
import {DiplomaticViewConfig} from './DiplomaticViewConfig';

import {renderWordBoundaries} from './renderWordBoundaries';
import {px} from './px';
import {calcTextRect} from './calcTextRect';
import {renderWord} from "./renderWord";
import {createHull} from "./createHull";
import {TextResizer} from "./TextResizer";
import {findSvgPath} from "./anno/findSvgPath";
import {Point} from "./Point";
import {findAnnotationResourceTarget} from "./findAnnotationResourceTarget";
import {orThrow} from "../util/orThrow";
import {createPoints} from "./createPoints";
import {calcBoundingPoints} from "./calcBoundingBox";
import {Id} from "./Id";
import {assertTextualBody} from "./anno/assertTextualBody";
import {calcTextAngle} from "./calcTextAngle";
import {calcBaseSegment} from "./calcBaseSegment";

export function renderDiplomaticView(
  $view: HTMLDivElement,
  page: AnnotationPage,
  config: DiplomaticViewConfig,
) {
  const {showBoundaries, showScanMargin} = config
  $view.innerHTML = '';

  // TODO: Make aware of height when provided:
  const {width: viewWidth, height: viewHeight} = $view.getBoundingClientRect();

  const {width: scanWidth, height: scanHeight} = page.partOf;

  const $text = document.createElement('div');
  $text.classList.add('text');
  $view.appendChild($text);
  const wordAnnos = page.items
    .filter(a => a.textGranularity === 'word');
  const words = wordAnnos.map(w => {
    const body = Array.isArray(w.body) ? w.body[0] : w.body;
    assertTextualBody(body);
    const id = w.id;
    const text = body.value;
    const hull: Point[] = createHull(findSvgPath(w));
    const base = calcBaseSegment(hull);
    const angle = calcTextAngle(base);
    return {id, text, hull, base, angle}
  })
  const marginlessRect = calcTextRect(words)

  /**
   * Add some padding to show characters at the edges
   * Characters can overflow vertically as words are fit into their
   * bounding boxes using width only.
   */
  const overflowPadding = Math.round(marginlessRect.width * 0.02)

  const factor = showScanMargin
    ? viewWidth / scanWidth
    : viewWidth / marginlessRect.width;
  const scale = (toScale: number) => toScale * factor
  const scalePoint = (p: Point): Point => [scale(p[0]), scale(p[1])];
  const scalePath = (path: string) => createPoints(path)
    .map(scalePoint)
    .map(p => `${p[0]},${p[1]}`).join(' ');

  if (showScanMargin) {
    $view.style.height = px(scale(scanHeight))
    $view.style.width = px(scale(scanWidth))
  } else {
    $view.style.height = px(scale(marginlessRect.height + overflowPadding * 2))
    $view.style.width = px(scale(marginlessRect.width))
    $text.style.marginTop = px(scale(-marginlessRect.top + overflowPadding));
    $text.style.marginLeft = px(scale(-marginlessRect.left));
  }
  const $boundaries = select($view)
    .append('svg')
    .attr('class', 'boundaries')

  if (showBoundaries) {
    const {width, height} = $view.getBoundingClientRect();

    if (showScanMargin) {
      $boundaries
        .attr('width', width)
        .attr('height', height);
    } else {
      $boundaries
        .style('margin-top', px(scale(-marginlessRect.top + overflowPadding)))
        .style('margin-left', px(scale(-marginlessRect.left)))
        .attr('width', width + scale(marginlessRect.left))
        .attr('height', height + scale(marginlessRect.top - overflowPadding));
    }
  }

  const resizer = new TextResizer();
  const $words = words.map(w =>
    renderWord(w.text, w.hull.map(scalePoint), scale(w.angle), $text)
  )
  resizer.calibrate($words.slice(0, 10).map(w => w));
  words.forEach((w, i) => {
    const $w = $words[i];
    resizer.resize($w);
    if (showBoundaries) {
      const scaledHulls = w.hull.map(scalePoint);
      const scaledBases = w.base.map(scalePoint);
      renderWordBoundaries($w, scaledHulls, scaledBases, $boundaries);
    }
  });

  const lineAnnos = page.items
    .filter(a => a.textGranularity === 'line');
  const blockAnnos = page.items
    .filter(a => a.textGranularity === 'block');
  const linePaths = lineAnnos
    .map(findSvgPath)
  linePaths.forEach(p => {
    $boundaries
      .append("polygon")
      .attr("points", scalePath(p))
      .attr("fill", "rgba(255,0,0,0.05)")
      .attr("stroke", "rgba(255,0,0,0.5)");
  })
  const blockPaths = blockAnnos
    .map(findSvgPath)
  blockPaths.forEach(p => {
    $boundaries
      .append("polygon")
      .attr("points", scalePath(p))
      .attr("fill", "rgba(0,255,0,0.05)")
      .attr("stroke", "rgba(0,255,0,0.5)");
  })

  const blockBoundaries: Map<Id, Point[]> = new Map()
  const lineToBlock: Map<Id, Id> = new Map()
  for (const line of lineAnnos) {
    const block = findAnnotationResourceTarget(line)
      ?? orThrow('No annotation resource target')
    lineToBlock.set(line.id, block.id)
  }
  for (const wordAnno of wordAnnos) {
    const line = findAnnotationResourceTarget(wordAnno)
      ?? orThrow('No annotation resource target')
    const blockId = lineToBlock.get(line.id)
      ?? orThrow(`No block for line ${line.id}`);
    if (!blockBoundaries.has(blockId)) {
      blockBoundaries.set(blockId, [])
    }
    const wordPoints = createPoints(findSvgPath(wordAnno));
    blockBoundaries.get(blockId)!.push(...wordPoints)
  }
  [...blockBoundaries.values()]
    .map(p => calcBoundingPoints(p).map(scalePoint))
    .forEach(p => {
      $boundaries
        .append("polygon")
        .attr("points", p.map(p => `${p[0]},${p[1]}`).join(' '))
        .attr("fill", "rgba(255,0,255,0.05)")
        .attr("stroke", "rgba(255,0,255,1)");
    })
}
