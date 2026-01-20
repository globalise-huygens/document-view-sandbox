import {setUrlParams} from "../../util/setUrlParam";

const defaultExample = 'lorem-ipsum';
export const exampleType = [defaultExample] as const
export type ExampleType = typeof exampleType[number]

export function getExampleFromUrl(): ExampleType | void {
  const param = new URLSearchParams(location.search).get('example') as ExampleType;
  if(exampleType.includes(param)) {
    return param;
  }
  setUrlParams({example: defaultExample})
  return defaultExample
}