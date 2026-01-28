import {getExampleFromUrl} from "./getExampleFromUrl";

export const examples = [
  'minimal',
  'line-wrapping'
] as const;
export type ExampleType = (typeof examples)[number];

export function getNormalizedExampleFromUrl(): ExampleType {
  return getExampleFromUrl(examples);
}
