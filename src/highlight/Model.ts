export type AnnotationId = string;
export type AnnotationType = 'location' | 'person' | 'event' | 'note';

export type WidthId = { id: AnnotationId };
export type Offsets<T extends WidthId = WidthId> = {
  begin: number;
  end: number;
  body: T;
};

export type RangeId = string;

export type CharRange = {
  id: RangeId;
  begin: number;
  end: number;
  annotations: AnnotationId[];
};

export type Offset = {
  charIndex: number;
  starting: Offsets[];
  ending: Offsets[];
};

export type Rgb = {
  r: number;
  g: number;
  b: number;
};
