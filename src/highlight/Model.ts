export type AnnotationId = string;
export type AnnotationType = 'location' | 'person' | 'event' | 'note';
export type AnnotationBody = EntityBody | NoteBody;
export type EntityBody = {
  id: AnnotationId;
  type: 'location' | 'person' | 'event';
};

export type NoteBody = {
  id: AnnotationId;
  type: 'note';
  note: string;
};

export type Annotation = {
  begin: number;
  end: number;
  body: AnnotationBody;
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
  starting: Annotation[];
  ending: Annotation[];
};

export type Rgb = {
  r: number;
  g: number;
  b: number;
};
