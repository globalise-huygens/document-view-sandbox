import type {
  Annotation as IiifAnnotation,
  AnnotationPage as IiifAnnotationPage,
  AnnotationTarget as IiifAnnotationTarget,
  Body as IiifBody,
  TextPositionSelector,
} from '@iiif/presentation-3';
import { Id } from './Id';

export type AnnotationPage = Omit<IiifAnnotationPage, 'partOf' | 'items'> & {
  partOf: PartOf;
  items: Annotation[];
};

export type Annotation = Omit<IiifAnnotation, 'body' | 'target'> & {
  body: Body[] | Body;
  target: AnnotationTarget[];
  purpose: string;
};

export type AnnotationTarget = IiifAnnotationTarget | AnnotationResourceTarget;

type BlockWithLabel = {
  id: Id;
  textGranularity: 'block';
  source: {
    label: string;
  };
};
export type Body = IiifBody | BlockWithLabel;

export const isBlockWithLabel = (toTest: Body): toTest is BlockWithLabel => {
  return !!(toTest as BlockWithLabel)?.source?.label;
};

export type TextualBody = {
  type: 'TextualBody';
  value: string;
  format?: string;
  language?: string;
};

export type SpecificResourceTarget = {
  type: 'SpecificResource';
  source: string;
  selector: Selector;
};
export type Selector = ValueSelector | TextPositionSelector;

export type ValueSelector = {
  type: string;
  value: string;
};

export type PartOf = {
  id: string;
  type: 'Canvas';
  height: number;
  width: number;
};

export type AnnotationResourceTarget = {
  id: string;
  type: 'Annotation';
};
