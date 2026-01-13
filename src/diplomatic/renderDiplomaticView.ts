import {Annotation, AnnotationPage} from './AnnoModel';
import {orThrow} from '../util/orThrow';
import {assertTextualBody} from './anno/assertTextualBody';
import {Point} from './Point';
import {createHull} from './createHull';
import {findSvgPath} from './anno/findSvgPath';
import {calcBaseSegment} from './calcBaseSegment';
import {calcTextAngle} from './calcTextAngle';
import {calcTextRect} from './calcTextRect';
import {px} from './px';
import {D3El} from './D3El';
import {select} from 'd3-selection';
import {TextResizer} from './TextResizer';
import {Id} from './Id';
import {renderWord} from './renderWord';
import {renderWordBoundaries} from './renderWordBoundaries';
import {findAnnotationResourceTarget} from './findAnnotationResourceTarget';
import {calcBoundingCorners, padCorners,} from './calcBoundingBox';
import {createPath} from './createPath';
import {calcScaleFactor, ViewFit} from './calcScaleFactor';
import {renderLineNumbers} from "./renderLineNumbers";
import {createBlockBoundaries} from "./createBlockBoundaries";
import {linkAnnotationResources} from "./linkAnnotationResources";

export interface DiplomaticViewConfig {
  showBoundaries: boolean;
  showScanMargin: boolean;
  fit: ViewFit;
}

const defaultConfig: DiplomaticViewConfig = {
  showBoundaries: false,
  showScanMargin: false,
  fit: 'width',
};

export function renderDiplomaticView(
  $view: HTMLDivElement,
  page: AnnotationPage,
  config?: Partial<DiplomaticViewConfig>,
) {
  const {showBoundaries, showScanMargin, fit} = {
    ...defaultConfig,
    ...config,
  };
  $view.innerHTML = '';
  const {width: scanWidth, height: scanHeight} = page.partOf;

  const $text = document.createElement('div');
  $text.classList.add('text');
  $view.appendChild($text);
  const wordAnnos = page.items.filter((a) => a.textGranularity === 'word');
  const words = wordAnnos.map((w) => {
    const body = Array.isArray(w.body) ? w.body[0] : w.body;
    assertTextualBody(body);
    const id = w.id;
    const text = body.value;
    const hull: Point[] = createHull(findSvgPath(w));
    const base = calcBaseSegment(hull);
    const angle = calcTextAngle(base);
    return {id, text, hull, base, angle};
  });
  const marginlessRect = calcTextRect(words);

  const overflowPadding = Math.round(marginlessRect.width * 0.05);
  const contentWidth = showScanMargin
    ? scanWidth
    : marginlessRect.width + overflowPadding * 2;
  const contentHeight = showScanMargin
    ? scanHeight
    : marginlessRect.height + overflowPadding * 2;
  const factor = calcScaleFactor(fit, $view, contentWidth, contentHeight);
  const scale = (toScale: number) => toScale * factor;
  const scalePoint = (p: Point): Point => [scale(p[0]), scale(p[1])];

  if (fit !== 'contain') {
    $view.style.width = px(scale(contentWidth));
    $view.style.height = px(scale(contentHeight));
  }

  if (!showScanMargin) {
    $text.style.marginTop = px(scale(-marginlessRect.top + overflowPadding));
    $text.style.marginLeft = px(scale(-marginlessRect.left + overflowPadding));
  }

  const $highlights: D3El<SVGSVGElement> = select($view)
    .append('svg')
    .attr('class', 'boundaries');

  const {width, height} = $view.getBoundingClientRect();

  if (showScanMargin) {
    $highlights.attr('width', width).attr('height', height);
  } else {
    $highlights
      .style('margin-top', px(scale(-marginlessRect.top + overflowPadding)))
      .style('margin-left', px(scale(-marginlessRect.left + overflowPadding)))
      .attr('width', width + scale(marginlessRect.left - overflowPadding))
      .attr('height', height + scale(marginlessRect.top - overflowPadding));
  }

  const resizer = new TextResizer();
  const $words: Record<Id, HTMLElement> = Object.fromEntries(
    words.map(({id, text, hull, angle}) => {
      const $word = renderWord(text, hull.map(scalePoint), scale(angle), $text);
      return [id, $word];
    }),
  );
  resizer.calibrate(Object.values($words).slice(0, 10));
  words.forEach(({id, hull, base}) => {
    const $word = $words[id];
    resizer.resize($word);
    if (showBoundaries) {
      const scaledHulls = hull.map(scalePoint);
      const scaledBases = base.map(scalePoint);
      renderWordBoundaries($word, scaledHulls, scaledBases, $highlights);
    }
  });

  const lineAnnos = page.items.filter((a) => a.textGranularity === 'line');

  const lineToBlock = linkAnnotationResources(lineAnnos);
  const blockBoundaries = createBlockBoundaries(wordAnnos, lineToBlock);
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

  const $lineNumbers = renderLineNumbers(page, $text, {factor});

  /**
   * Prevent flickering of blocks and lines when hovering words
   */
  const hideLineTimeouts: Map<Id, number> = new Map();
  const hideBlockTimeouts: Map<Id, number> = new Map();

  function showLine(lineId: Id) {
    const existingTimeout = hideLineTimeouts.get(lineId);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
      hideLineTimeouts.delete(lineId);
    }
    $lineNumbers[lineId].style.display = 'block';
  }

  function hideLine(lineId: Id) {
    const timeoutId = window.setTimeout(() => {
      $lineNumbers[lineId].style.display = 'none';
      hideLineTimeouts.delete(lineId);
    }, 50);
    hideLineTimeouts.set(lineId, timeoutId);
  }

  function showBlock(blockId: Id) {
    const existingTimeout = hideBlockTimeouts.get(blockId);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
      hideBlockTimeouts.delete(blockId);
    }
    $blockHighlights[blockId].attr('visibility', 'visible');
  }

  function hideBlock(blockId: Id) {
    const timeoutId = window.setTimeout(() => {
      $blockHighlights[blockId].attr('visibility', 'hidden');
      hideBlockTimeouts.delete(blockId);
    }, 150);
    hideBlockTimeouts.set(blockId, timeoutId);
  }

  wordAnnos.forEach((word) => {
    const id = word.id;
    const $word = $words[id];
    const lineId = findAnnotationResourceTarget(word).id;
    const blockId = lineToBlock[lineId] ?? orThrow(`No line ${lineId}`);
    $word.addEventListener('mouseenter', () => {
      showLine(lineId);
      showBlock(blockId);
    });
    $word.addEventListener('mouseleave', () => {
      hideLine(lineId);
      hideBlock(blockId);
    });
  });
}
