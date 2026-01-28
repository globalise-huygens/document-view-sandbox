import {getExampleFromUrl} from "../../normalized/example/getExampleFromUrl";

export const examples = [
  'scan',
  'regions',
  'entities',
  'line-by-line',
  'select'
] as const;
export type ExampleType = (typeof examples)[number];

export function getDiplomaticExampleFromUrl(): ExampleType {
  return getExampleFromUrl(examples);
}
