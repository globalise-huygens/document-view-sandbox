import {renderRegionsExample} from './example/renderRegionsExample';
import {renderScanExample} from './example/renderScanExample';
import {$} from './example/$';
import {getDiplomaticExampleFromUrl} from './example/Examples';
import {renderEntityExample} from './example/renderEntityExample';
import {reloadOnEsBuild} from '../util/reloadOnEsBuild';
import {
  renderDualViewExample
} from "./example/renderDualViewExample";
import {renderSelectExample} from "./example/renderSelectExample";

reloadOnEsBuild();

document.addEventListener('DOMContentLoaded', async () => {
  const example = getDiplomaticExampleFromUrl();
  $('a.' + example).classList.add('active');
  const $example = $('#example');

  if (example === 'scan') {
    await renderScanExample($example);
  } else if (example === 'regions') {
    await renderRegionsExample($example);
  } else if (example === 'dual-view') {
    await renderDualViewExample($example);
  } else if (example === 'entities') {
    await renderEntityExample($example);
  } else if (example === 'select') {
    await renderSelectExample($example);
  }
});
