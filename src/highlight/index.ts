import {$} from "../diplomatic/example/$";
import {getExampleFromUrl} from "./example/Example";
import {renderLoremIpsumExample} from "./example/renderLoremIpsumExample";
import {renderPageEntitiesExample} from "./example/renderPageEntitiesExample";

if (DEV) {
  new EventSource('/esbuild').addEventListener('change', () =>
    location.reload(),
  );
}

document.addEventListener('DOMContentLoaded', async () => {
  const example = getExampleFromUrl()
  $('a.' + example).classList.add('active');
  const $example = $('#example');

  if (example === 'lorem-ipsum') {
    await renderLoremIpsumExample($example);
  } else {
    await renderPageEntitiesExample($example)
  }
});

