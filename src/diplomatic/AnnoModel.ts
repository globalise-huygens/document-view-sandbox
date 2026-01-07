import type {
  Annotation as IiifAnnotation,
  AnnotationPage as IiifAnnotationPage,
  AnnotationTarget as IiifAnnotationTarget
} from '@iiif/presentation-3';

export type AnnotationPage = Omit<IiifAnnotationPage, 'partOf' | 'items'> & {
  partOf: PartOf;
  items: Annotation[]
};


export type Annotation = IiifAnnotation & {
  target: AnnotationTarget
}

export type AnnotationTarget = IiifAnnotationTarget | AnnotationResourceTarget

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

export type AnnotationResourceTarget = {
  id: string,
  type: "Annotation"
}

