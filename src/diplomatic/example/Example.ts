import {setUrlParams} from "../../util/setUrlParam";

const defaultExample = 'with-scan';
export const example = [defaultExample, 'text-only', 'with-entities'] as const
export type ExampleType = typeof example[number]

export function getExampleFromUrl(): ExampleType {
  const param = new URLSearchParams(location.search).get('example') as ExampleType;
  if(example.includes(param)) {
    return param;
  }
  setUrlParams({example: defaultExample})
  return defaultExample
}