import { $ } from './example/$';
import { getDiplomaticExampleFromUrl } from './example/Examples';
import { reloadOnEsBuild } from '../util/reloadOnEsBuild';
import { renderDualViewExample } from './example/renderDualViewExample';

import "@knaw-huc/original-layout/style.css";

reloadOnEsBuild();

document.addEventListener('DOMContentLoaded', async () => {
  const example = getDiplomaticExampleFromUrl();
  $('a.' + example).classList.add('active');
  const $example = $('#example');

  if (example === 'dual-view') {
    await renderDualViewExample($example);
  }
});
