import {getExampleFromUrl} from "../../normalized/example/getExampleFromUrl";

export const examples = ['page-entities', 'lorem-ipsum'] as const;
export type ExampleType = (typeof examples)[number];

export function getHighlightExampleFromUrl(): ExampleType | void {
  return getExampleFromUrl(examples);
}
