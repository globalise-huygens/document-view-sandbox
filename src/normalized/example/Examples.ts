import {getExampleFromUrl} from "./getExampleFromUrl";

const defaultExample = 'minimal';
export const examples = [
  defaultExample,
  'line-wrapping'
] as const;
export type ExampleType = (typeof examples)[number];

export function getNormalizedExampleFromUrl(): ExampleType {
  return getExampleFromUrl(examples, defaultExample);
}
