import { renderScanExample } from './example/renderScanExample';
import { $ } from './example/$';
import { getDiplomaticExampleFromUrl } from './example/Examples';
import { reloadOnEsBuild } from '../util/reloadOnEsBuild';
import { renderDualViewExample } from './example/renderDualViewExample';

reloadOnEsBuild();

document.addEventListener('DOMContentLoaded', async () => {
  const example = getDiplomaticExampleFromUrl();
  $('a.' + example).classList.add('active');
  const $example = $('#example');

  if (example === 'scan') {
    await renderScanExample($example);
  } else if (example === 'dual-view') {
    await renderDualViewExample($example);
  }
});
