import {Annotation, AnnotationPage} from './AnnoModel';
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
import {findResourceTarget} from './findResourceTarget';
import {calcScaleFactor, ViewFit} from './calcScaleFactor';
import {renderLineNumbers} from "./renderLineNumbers";
import {renderBlocks} from "./renderBlocks";
import {isSpecificResourceTarget} from "./anno/isSpecificResourceTarget";
import {
  assertSpecificResourceTarget
} from "./anno/assertSpecificResourceTarget";
import {assertSvgSelector} from "./anno/assertSvgSelector";
import {createPoints} from "./createPoints";
import {parseSvgPath} from "./anno/parseSvgPath";
import {createPath} from "./createPath";
import {createScale, Scale} from "./Scale";

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
  const annotations = page.items.reduce((prev, curr) => {
    prev[curr.id] = curr
    return prev
  }, {} as Record<Id, Annotation>)
  const $text = document.createElement('div');
  $text.classList.add('text');
  $view.appendChild($text);
  const wordAnnos = page.items.filter((a) => a.textGranularity === 'word');
  const words = wordAnnos.map((word) => {
    const {id, body: bodies} = word
    const body = Array.isArray(bodies) ? bodies[0] : bodies;
    assertTextualBody(body);
    const text = body.value;
    const hull: Point[] = createHull(findSvgPath(word));
    const base = calcBaseSegment(hull);
    const angle = calcTextAngle(base);
    return {id, text, hull, base, angle};
  });
  const marginlessRect = calcTextRect(words);
  /**
   * Add some vertical padding to show overflowing characters.
   * Characters are fit into their bounding boxes using width only.
   */
  const overflowPadding = Math.round(marginlessRect.width * 0.05);
  const contentWidth = showScanMargin
    ? scanWidth
    : marginlessRect.width + overflowPadding * 2;
  const contentHeight = showScanMargin
    ? scanHeight
    : marginlessRect.height + overflowPadding * 2;

  const factor = calcScaleFactor(fit, $view, contentWidth, contentHeight);
  const scale = createScale(factor)

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
      const $word = renderWord(text, scale.path(hull), scale(angle), $text);
      return [id, $word];
    }),
  );
  resizer.calibrate(Object.values($words).slice(0, 10));
  words.forEach(({id, hull, base}) => {
    const $word = $words[id];
    resizer.resize($word);
    if (showBoundaries) {
      const scaledHull = scale.path(hull);
      const scaledBase = scale.path(base);
      renderWordBoundaries($word, scaledHull, scaledBase, $highlights);
    }
  });

  const $blockHighlights = renderBlocks(annotations, $highlights, {scale});
  const $lineNumbers = renderLineNumbers(annotations, $text, {scale});

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
    const line = annotations[findResourceTarget(word).id];
    const block = annotations[findResourceTarget(line).id];
    $word.addEventListener('mouseenter', () => {
      showLine(line.id);
      showBlock(block.id);
    });
    $word.addEventListener('mouseleave', () => {
      hideLine(line.id);
      hideBlock(block.id);
    });
  });
}
