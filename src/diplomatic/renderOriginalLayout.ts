import {Point} from './Point';
import {createHull} from './createHull';
import {calcBaseSegment} from './calcBaseSegment';
import {calcTextAngle} from './calcTextAngle';
import {calcTextRect} from './calcTextRect';
import {calcScaleFactor, ViewFit} from './calcScaleFactor';
import {createScale, Scale} from './Scale';
import {px} from './px';
import {D3El} from './D3El';
import {select} from 'd3-selection';
import {TextResizer} from './TextResizer';
import {Id} from './anno/Id';
import {renderFragment} from './renderFragment';
import {renderFragmentBoundaries} from './renderFragmentBoundaries';
import {orThrow} from '../util/orThrow';
import {Fragment} from "./Fragment";

export interface FullOriginalLayoutConfig {
  showBoundaries: boolean;
  showScanMargin: boolean;
  fit: ViewFit;
  page: {
    height: number;
    width: number;
  };
}

export type OriginalLayoutConfig = Partial<FullOriginalLayoutConfig> &
  Pick<FullOriginalLayoutConfig, 'page'>;

export const defaultConfig: FullOriginalLayoutConfig = {
  showBoundaries: false,
  showScanMargin: false,
  fit: 'width',
  page: {
    height: 0,
    width: 0,
  },
};

export type OriginalLayoutResult = {
  scale: Scale;
  $fragments: Record<Id, HTMLElement>;
  $layout: HTMLElement;
  $overlay: SVGSVGElement;
};

export function renderOriginalLayout(
  $view: HTMLDivElement,
  fragments: Fragment[],
  config: OriginalLayoutConfig,
): OriginalLayoutResult {
  const { fit, showBoundaries, showScanMargin } = {
    ...defaultConfig,
    ...config,
  };
  const { width: pageWidth, height: pageHeight } = config.page;

  const rotatedFragments = fragments.map((fragment) => {
    const {id, text, path} = fragment;
    const hull: Point[] = createHull(path);
    const base = calcBaseSegment(hull);
    const angle = calcTextAngle(base);
    return { id, text, hull, base, angle };
  });

  /**
   * Text without the whitespace surrounding the scanned page
   */
  const marginlessRect = calcTextRect(rotatedFragments);

  /**
   * Add some padding to show line numbers and overflowing characters.
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
  const scale = createScale(factor);

  if (fit !== 'contain') {
    $view.style.width = px(scale(contentWidth));
    $view.style.height = px(scale(contentHeight));
  }

  const $layout = document.createElement('div');
  $view.appendChild($layout);
  $layout.classList.add('text');

  if (!showScanMargin) {
    $layout.style.marginTop = px(scale(-marginlessRect.top + overflowPadding));
    $layout.style.marginLeft = px(scale(-marginlessRect.left + overflowPadding));
  }

  const { width, height } = $view.getBoundingClientRect();
  const $svg: D3El<SVGSVGElement> = select($view)
    .append('svg')
    .attr('class', 'overlay');

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
  const $fragments: Record<Id, HTMLElement> = Object.fromEntries(
    rotatedFragments.map(({ id, text, hull, angle }) => {
      const $fragment = renderFragment(text, scale.path(hull), angle, $layout);
      return [id, $fragment];
    }),
  );
  resizer.calibrate(Object.values($fragments).slice(0, 10));

  rotatedFragments.forEach(({ id, hull, base }) => {
    const $fragment = $fragments[id];
    resizer.resize($fragment);
    if (showBoundaries) {
      const scaledHull = scale.path(hull);
      const scaledBase = scale.path(base);
      renderFragmentBoundaries($fragment, scaledHull, scaledBase, $svg);
    }
  });
  return {
    $layout,
    $overlay: $svg.node() ?? orThrow('No svg element'),
    $fragments,
    scale,
  };
}
