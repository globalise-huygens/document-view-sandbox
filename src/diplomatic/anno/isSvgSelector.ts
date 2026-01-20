import { ValueSelector } from '../AnnoModel';

export const isSvgSelector = (selector: any): selector is ValueSelector =>
  selector &&
  selector.type === 'SvgSelector' &&
  typeof selector.value === 'string';
