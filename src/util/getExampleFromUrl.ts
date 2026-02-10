import { orThrow } from './orThrow';
import { setUrlParams } from './setUrlParam';

export function getExampleFromUrl<T extends string>(options: readonly T[]) {
  const defaultExample = options[0] ?? orThrow('No default');
  const param = new URLSearchParams(location.search).get('example') as T;
  if (options.includes(param)) {
    return param;
  }
  setUrlParams({ example: defaultExample });
  return defaultExample;
}
