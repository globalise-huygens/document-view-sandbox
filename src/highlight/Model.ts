/**
 * Input
 */
export type AnnotationRange<T extends WidthId = WidthId> = {
  begin: number;
  end: number;
  body: T;
};

/**
 * Output
 */
export type TextRange = {
  id: RangeId;
  begin: number;
  end: number;
  annotations: AnnotationId[];
};

export type AnnotationId = string;
export type WidthId = { id: AnnotationId };
export type RangeId = string;
