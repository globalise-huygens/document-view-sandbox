import {ValueSelector} from './AnnoModel';

export const isSvgSelector = (selector: unknown): selector is ValueSelector =>
  !!selector &&
  (selector as ValueSelector).type === 'SvgSelector' &&
  typeof (selector as ValueSelector).value === 'string';
