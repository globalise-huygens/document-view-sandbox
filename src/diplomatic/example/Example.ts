export const example = ['with-scan', 'text-only', 'with-entities'] as const
export type ExampleType = typeof example[number]

export function getExampleFromUrl(): ExampleType {
  const param = new URLSearchParams(location.search).get('example') as ExampleType;
  if(example.includes(param)) {
    return param;
  }
  return 'with-scan'
}