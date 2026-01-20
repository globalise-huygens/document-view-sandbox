export function toClassName(str: string) {
  return str
    .toLowerCase()
    .replaceAll(' ', '-')
    .replaceAll(/[^a-z0-9-]/gi, '');
}