export type IiifAnnotationPage = {
  "@context": string | string[];
  type: "AnnotationPage";
  id: string;
  label: string;
  items: Annotation[];
  partOf?: PartOf;
};

export type Annotation = {
  type: "Annotation";
  id: string;
  motivation: string;
  textGranularity?: string;
  body?: AnnotationBody[];
  target: AnnotationTarget[];
};

export type AnnotationBody = SpecificResource | TextualBody;

export type SpecificResource = {
  type: "SpecificResource";
  source: SourceConcept;
  purpose: string;
};

export type SourceConcept = {
  id: string;
  type: string;
  label: string;
};

export type TextualBody = {
  type: "TextualBody";
  value: string;
};

export type AnnotationTarget = SpecificResourceTarget | AnnotationReference;

export type SpecificResourceTarget = {
  type: "SpecificResource";
  source: string;
  selector: Selector;
};

export type AnnotationReference = {
  id: string;
  type: "Annotation";
};

export type Selector = {
  type: string;
  value: string;
};

export type PartOf = {
  id: string;
  type: "Canvas";
  height: number;
  width: number;
};