import { $ } from '../diplomatic/example/$';
import { reloadOnEsBuild } from '../util/reloadOnEsBuild';
import { getNormalizedExampleFromUrl } from './example/Examples';
import { renderMinimalExample } from './example/renderMinimalExample';
import { renderLineWrappingExample } from './example/renderLineWrappingExample';

import '../../packages/line-by-line/src/normalized.css';

reloadOnEsBuild();

main();

async function main() {
  reloadOnEsBuild();

  document.addEventListener('DOMContentLoaded', async () => {
    const example = getNormalizedExampleFromUrl();
    $('a.' + example).classList.add('active');
    const $example = $('#example');
    $example.classList.add(example);
    if (example === 'minimal') {
      await renderMinimalExample($example);
    } else if (example === 'line-wrapping') {
      await renderLineWrappingExample($example);
    }
  });
}
