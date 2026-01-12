import { orThrow } from '../util/orThrow';

export type ViewFit =
  | 'width'    // $view must have width, height is calculated
  | 'height'   // $view must have height, width is calculated
  | 'contain'; // $view must have both, content fits inside

/**
 * Determine scaling factor based on fit mode, view element and scan dimensions
 */
export function calcScaleFactor(
  fit: ViewFit,
  $view: HTMLElement,
  contentWidth: number,
  contentHeight: number,
): number {
  const { width: viewWidth, height: viewHeight } =
    $view.getBoundingClientRect();

  const needsWidth = fit === 'width' || fit === 'contain';
  if (needsWidth && !viewWidth) {
    throw new Error(`Element must have width for fit mode: ${fit}`);
  }
  const needsHeight = fit === 'height' || fit === 'contain';
  if (needsHeight && !viewHeight) {
    throw new Error(`Element must have height for fit mode: ${fit}`);
  }
  switch (fit) {
    case 'width':
      return viewWidth / contentWidth;
    case 'height':
      return viewHeight / contentHeight;
    case 'contain':
      return Math.min(
        viewWidth / contentWidth,
        viewHeight / contentHeight,
      );
  }
}