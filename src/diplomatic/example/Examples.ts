import { getExampleFromUrl } from '../../util/getExampleFromUrl';

export const examples = [
  'dual-view',
  'scan',
] as const;
export type ExampleType = (typeof examples)[number];

export function getDiplomaticExampleFromUrl(): ExampleType {
  return getExampleFromUrl(examples);
}
