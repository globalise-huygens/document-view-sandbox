import { BaseType, Selection } from 'd3-selection';

export type $D3<T extends BaseType = BaseType> = Selection<
  T,
  unknown,
  null,
  undefined
>;
