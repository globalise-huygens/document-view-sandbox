import {setUrlParams} from "../../util/setUrlParam";

export function getExampleFromUrl<T extends string>(
  options: readonly T[],
  defaultExample: T
) {
  const param = new URLSearchParams(location.search).get('example') as T;
  if (options.includes(param)) {
    return param;
  }
  setUrlParams({example: defaultExample});
  return defaultExample;
}