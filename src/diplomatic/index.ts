import { renderRegionsExample } from './example/renderRegionsExample';
import { renderScanExample } from './example/renderScanExample';
import { $ } from './example/$';
import { getExampleFromUrl } from './example/Example';
import { renderEntityExample } from './example/renderEntityExample';
import { reloadOnEsBuild } from '../util/reloadOnEsBuild';
import {
  renderToggleLineByLineExample
} from "./example/renderToggleLineByLineExample";

reloadOnEsBuild();

document.addEventListener('DOMContentLoaded', async () => {
  const example = getExampleFromUrl();
  $('a.' + example).classList.add('active');
  const $example = $('#example');

  if (example === 'with-scan') {
    await renderScanExample($example);
  } else if (example === 'with-regions') {
    await renderRegionsExample($example);
  } else if (example === 'with-line-by-line') {
    await renderToggleLineByLineExample($example);
  } else {
    await renderEntityExample($example);
  }
});
