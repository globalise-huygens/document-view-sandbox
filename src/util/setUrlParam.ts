export function setUrlParams(entries: Record<string,string>) {
  const url = new URL(window.location.href);
  Object.entries(entries).forEach(([k, v]) => url.searchParams.set(k, v))
  history.pushState({}, '', url);
}