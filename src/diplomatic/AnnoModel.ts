import type {Annotation, AnnotationPage,} from '@iiif/presentation-3';

export type IiifAnnotationPage = Omit<AnnotationPage, 'partOf'> & {
  partOf: PartOf;
};
export type { Annotation };

export type TextualBody = {
  type: 'TextualBody';
  value: string;
  format?: string;
  language?: string;
};

export type SpecificResource = {
  type: 'SpecificResource';
  source: string | Source;
  selector?: Selector;
  purpose?: string;
};

export type Source = {
  id: string;
  type: string;
  label: string;
};

export type Selector = {
  type: string;
  value: string;
};

export type SpecificResourceTarget = {
  type: 'SpecificResource';
  source: string;
  selector: Selector;
};

export type PartOf = {
  id: string;
  type: 'Canvas';
  height: number;
  width: number;
};