import {$} from '../diplomatic/example/$';
import {getHighlightExampleFromUrl} from './example/Example';
import {renderLoremIpsumExample} from './example/renderLoremIpsumExample';
import {renderPageEntitiesExample} from './example/renderPageEntitiesExample';
import {reloadOnEsBuild} from '../util/reloadOnEsBuild';

reloadOnEsBuild();

document.addEventListener('DOMContentLoaded', async () => {
  const example = getHighlightExampleFromUrl();
  $('a.' + example).classList.add('active');
  const $example = $('#example');

  if (example === 'lorem-ipsum') {
    await renderLoremIpsumExample($example);
  } else {
    await renderPageEntitiesExample($example);
  }
});
