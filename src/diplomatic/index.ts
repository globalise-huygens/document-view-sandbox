import { renderRegionsExample } from './example/renderRegionsExample';
import { renderScanExample } from './example/renderScanExample';
import { $ } from './example/$';
import { getExampleFromUrl } from './example/Example';
import { renderEntityExample } from './example/renderEntityExample';

if (DEV) {
  new EventSource('/esbuild').addEventListener('change', () =>
    location.reload(),
  );
}

document.addEventListener('DOMContentLoaded', async () => {
  const example = getExampleFromUrl();
  $('a.' + example).classList.add('active');
  const $example = $('#example');

  if (example === 'with-scan') {
    await renderScanExample($example);
  } else if (example === 'with-regions') {
    await renderRegionsExample($example);
  } else {
    await renderEntityExample($example);
  }
});
