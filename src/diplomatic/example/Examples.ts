import {getExampleFromUrl} from "../../normalized/example/getExampleFromUrl";

const defaultExample = 'with-scan';
export const examples = [
  defaultExample,
  'with-regions',
  'with-entities',
  'with-line-by-line',
] as const;
export type ExampleType = (typeof examples)[number];

export function getDiplomaticExampleFromUrl(): ExampleType {
  return getExampleFromUrl(examples, defaultExample);
}
