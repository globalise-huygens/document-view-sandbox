import {AnnotationPage} from "./AnnoModel";
import {assertTextualBody} from "./anno/assertTextualBody";
import {Point} from "./Point";
import {createHull} from "./createHull";
import {findSvgPath} from "./anno/findSvgPath";
import {calcBaseSegment} from "./calcBaseSegment";
import {calcTextAngle} from "./calcTextAngle";
import {calcTextRect} from "./calcTextRect";
import {calcScaleFactor, ViewFit} from "./calcScaleFactor";
import {createScale} from "./Scale";
import {px} from "./px";
import {D3El} from "./D3El";
import {select} from "d3-selection";
import {TextResizer} from "./TextResizer";
import {Id} from "./Id";
import {renderWord} from "./renderWord";
import {renderWordBoundaries} from "./renderWordBoundaries";

export interface OriginalLayoutConfig {
  showBoundaries: boolean;
  showScanMargin: boolean;
  fit: ViewFit;
}

export const defaultConfig: OriginalLayoutConfig = {
  showBoundaries: false,
  showScanMargin: false,
  fit: 'width',
};

export function renderOriginalLayout(
  $view: HTMLDivElement,
  page: AnnotationPage,
  config?: Partial<OriginalLayoutConfig>
) {
  const {fit, showBoundaries, showScanMargin} = {
    ...defaultConfig,
    ...config,
  };
  const {width: pageWidth, height: pageHeight} = page.partOf;

  const wordAnnos = page.items
    .filter((a) => a.textGranularity === 'word');

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

  /**
   * Text without the whitespace surrounding the scanned page
   */
  const marginlessRect = calcTextRect(words);

  /**
   * Add some vertical padding to show overflowing characters.
   * Characters are fit into their bounding boxes using width only.
   */
  const overflowPadding = Math.round(marginlessRect.width * 0.05);

  const contentWidth = showScanMargin
    ? pageWidth
    : marginlessRect.width + overflowPadding * 2;
  const contentHeight = showScanMargin
    ? pageHeight
    : marginlessRect.height + overflowPadding * 2;

  const factor = calcScaleFactor(fit, $view, contentWidth, contentHeight);
  const scale = createScale(factor)

  if (fit !== 'contain') {
    $view.style.width = px(scale(contentWidth));
    $view.style.height = px(scale(contentHeight));
  }

  const $text = document.createElement('div');
  $view.appendChild($text);
  $text.classList.add('text');

  if (!showScanMargin) {
    $text.style.marginTop = px(scale(-marginlessRect.top + overflowPadding));
    $text.style.marginLeft = px(scale(-marginlessRect.left + overflowPadding));
  }

  const {width, height} = $view.getBoundingClientRect()
  const $svg: D3El<SVGSVGElement> = select($view)
    .append('svg')
    .attr('class', 'boundaries');

  if (showScanMargin) {
    $svg.attr('width', width).attr('height', height);
  } else {
    $svg
      .style('margin-top', px(scale(-marginlessRect.top + overflowPadding)))
      .style('margin-left', px(scale(-marginlessRect.left + overflowPadding)))
      .attr('width', width + scale(marginlessRect.left - overflowPadding))
      .attr('height', height + scale(marginlessRect.top - overflowPadding));
  }

  const resizer = new TextResizer();
  const $words: Record<Id, HTMLElement> = Object.fromEntries(
    words.map(({id, text, hull, angle}) => {
      const $word = renderWord(text, scale.path(hull), angle, $text);
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
      renderWordBoundaries($word, scaledHull, scaledBase, $svg);
    }
  });
  return {$svg, $text, $words, scale};
}