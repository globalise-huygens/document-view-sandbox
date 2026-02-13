import {setUrlParams} from "../../util/setUrlParam";
import {orThrow} from "../../util/orThrow";

export function getExampleFromUrl<T extends string>(
  options: readonly T[]
) {
  const defaultExample = options[0] ?? orThrow('No default');
  const param = new URLSearchParams(location.search).get('example') as T;
  if (options.includes(param)) {
    return param;
  }
  setUrlParams({example: defaultExample});
  return defaultExample;
}