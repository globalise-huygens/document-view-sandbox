import { Selector } from '../AnnoModel';
import { isSvgSelector } from './isSvgSelector';

export function assertSvgSelector(
  selector: unknown,
): asserts selector is Selector {
  if (!isSvgSelector(selector)) {
    throw new Error('Expected SvgSelector');
  }
}
