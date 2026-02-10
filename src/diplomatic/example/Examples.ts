import { getExampleFromUrl } from '../../util/getExampleFromUrl';

export const examples = [
  'scan',
  'regions',
  'entities',
  'dual-view',
  'select',
  'offsets',
] as const;
export type ExampleType = (typeof examples)[number];

export function getDiplomaticExampleFromUrl(): ExampleType {
  return getExampleFromUrl(examples);
}
