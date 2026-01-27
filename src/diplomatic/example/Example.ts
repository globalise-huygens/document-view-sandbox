import { setUrlParams } from '../../util/setUrlParam';

const defaultExample = 'with-scan';
export const example = [
  defaultExample,
  'with-regions',
  'with-entities',
  'with-line-by-line',
] as const;
export type ExampleType = (typeof example)[number];

export function getExampleFromUrl(): ExampleType {
  const param = new URLSearchParams(location.search).get(
    'example',
  ) as ExampleType;
  if (example.includes(param)) {
    return param;
  }
  setUrlParams({ example: defaultExample });
  return defaultExample;
}
