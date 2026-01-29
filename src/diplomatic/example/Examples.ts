import {getExampleFromUrl} from "../../normalized/example/getExampleFromUrl";

export const examples = [
  'scan',
  'regions',
  'entities',
  'dual-view',
  'select'
] as const;
export type ExampleType = (typeof examples)[number];

export function getDiplomaticExampleFromUrl(): ExampleType {
  return getExampleFromUrl(examples);
}
