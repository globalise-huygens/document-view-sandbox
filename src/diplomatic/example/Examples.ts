import { getExampleFromUrl } from '../../util/getExampleFromUrl';

export const examples = [
  'dual-view',
] as const;
export type ExampleType = (typeof examples)[number];

export function getDiplomaticExampleFromUrl(): ExampleType {
  return getExampleFromUrl(examples);
}
