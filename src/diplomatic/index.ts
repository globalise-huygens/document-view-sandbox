import { renderTextOnlyExample } from './example/renderTextOnlyExample';
import { renderScanExample } from './example/renderScanExample';
import { $ } from './example/$';

if (DEV) {
  new EventSource('/esbuild').addEventListener('change', () =>
    location.reload(),
  );
}

document.addEventListener('DOMContentLoaded', async () => {
  const example =
    new URLSearchParams(location.search).get('example') ?? 'with-scan';
  $('a.' + example).classList.add('active');
  const $example = $('#example');

  if (example === 'with-scan') {
    await renderScanExample($example);
  } else {
    await renderTextOnlyExample($example);
  }
});
