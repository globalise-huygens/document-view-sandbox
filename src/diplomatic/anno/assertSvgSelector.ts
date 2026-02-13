import { ValueSelector } from '../AnnoModel';
import { isSvgSelector } from './isSvgSelector';

export function assertSvgSelector(
  selector: unknown,
): asserts selector is ValueSelector {
  if (!isSvgSelector(selector)) {
    throw new Error('Expected SvgSelector');
  }
}
