export const exampleType = ['lorem-ipsum'] as const
export type ExampleType = typeof exampleType[number]

export function getExampleFromUrl(): ExampleType {
  const param = new URLSearchParams(location.search).get('example') as ExampleType;
  if(exampleType.includes(param)) {
    return param;
  }
  return 'lorem-ipsum'
}