export function joinElements(
  elements: HTMLElement[],
  separator = defaultSeparator,
): HTMLElement[] {
  return elements.flatMap((span) => [span, separator()]).slice(0, -1);
}

function defaultSeparator() {
  const span = document.createElement('span');
  span.textContent = ' ';
  return span;
}
