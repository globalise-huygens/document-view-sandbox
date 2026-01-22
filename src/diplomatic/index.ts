import { renderRegionsExample } from './example/renderRegionsExample';
import { renderScanExample } from './example/renderScanExample';
import { $ } from './example/$';
import { getExampleFromUrl } from './example/Example';
import { renderEntityExample } from './example/renderEntityExample';
import { reloadOnEsBuild } from '../util/reloadOnEsBuild';

reloadOnEsBuild();

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
