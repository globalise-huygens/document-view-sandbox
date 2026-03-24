export function reloadOnEsBuild() {
  const esbuildEvent = new EventSource('/esbuild');
  window.addEventListener('beforeunload', () => esbuildEvent.close());
  esbuildEvent.addEventListener('change', () => location.reload());
}
