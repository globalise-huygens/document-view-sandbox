import {select} from 'd3-selection';
import {Annotation, AnnotationPage} from './AnnoModel';
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
import {calcBoundingBox} from "./calcBoundingBox";
import {Id} from "./Id";
import {assertTextualBody} from "./anno/assertTextualBody";
import {calcTextAngle} from "./calcTextAngle";
import {calcBaseSegment} from "./calcBaseSegment";
import {createPath} from "./createPath";
import {Rect} from "./Rect";

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
  const overflowPadding = Math.round(marginlessRect.width * 0.05)

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
    $view.style.width = px(scale(marginlessRect.width + overflowPadding * 2))
    $text.style.marginTop = px(scale(-marginlessRect.top + overflowPadding));
    $text.style.marginLeft = px(scale(-marginlessRect.left + overflowPadding));
  }
  const $boundaries = select($view)
    .append('svg')
    .attr('class', 'boundaries')

  const {width, height} = $view.getBoundingClientRect();

  if (showScanMargin) {
    $boundaries
      .attr('width', width)
      .attr('height', height);
  } else {
    $boundaries
      .style('margin-top', px(scale(-marginlessRect.top + overflowPadding)))
      .style('margin-left', px(scale(-marginlessRect.left + overflowPadding)))
      .attr('width', width + scale(marginlessRect.left - overflowPadding))
      .attr('height', height + scale(marginlessRect.top - overflowPadding));
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
  const wordAnnosByLine: Map<Id, Annotation[]> = new Map()
  for (const wordAnno of wordAnnos) {
    const target = findAnnotationResourceTarget(wordAnno)
      ?? orThrow(`No line found for word ${wordAnno.id}`)
    if (!wordAnnosByLine.has(target.id)) {
      wordAnnosByLine.set(target.id, [])
    }
    wordAnnosByLine.get(target.id)!.push(wordAnno)
  }
  lineAnnos.forEach((a, i) => {
    const path = findSvgPath(a)
    const points = createPoints(path)
    const scaled = points.map(scalePoint)
    // $boundaries
    //   .append("polygon")
    //   .attr("points", createPath(scaled))
    //   .attr("fill", "rgba(255,0,0,0.05)")
    //   .attr("stroke", "rgba(255,0,0,0.5)");

    const $lineNumber = document.createElement('span')
    $text.appendChild($lineNumber)
    $lineNumber.classList.add('line-number')
    $lineNumber.textContent = `${i + 1}`.padStart(2, '0')

    const words = wordAnnosByLine.get(a.id)
    if (!words) {
      console.warn('Line without words')
      return;
    }

    // TODO: pick most left word in line, use that bbox
    const bbox: Rect = words.reduce<Rect | null>((prev, curr) => {
      const bbox = calcBoundingBox(createPoints(findSvgPath(curr)).map(scalePoint))
      if(!prev) {
        return bbox;
      }
      if(prev.left < bbox.left) {
        return prev
      }
      return bbox
    }, null) ?? orThrow('No leftmost word found')
    // TODO: left position should be determined by the block words bb
    Object.assign($lineNumber.style, {
      left: px(bbox.left),
      top: px(bbox.top + bbox.height / 2),
      marginLeft: px(-scale(120)),
      marginTop: px(-scale(40)),
      fontSize: px(scale(80))
    })

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
  // [...blockBoundaries.values()]
  //   .map(p => calcBoundingPoints(p).map(scalePoint))
  //   .forEach(p => {
  //     $boundaries
  //       .append("polygon")
  //       .attr("points", createPath(p))
  //       .attr("fill", "rgba(255,0,255,0.05)")
  //       .attr("stroke", "rgba(255,0,255,1)");
  //   })
}
