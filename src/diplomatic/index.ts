import {Selection} from 'd3-selection';
import {renderTextOnlyExample} from "./example/renderTextOnlyExample";
import {renderScanExample} from "./example/renderScanExample";
import {$} from "./example/$";

export type D3Svg = Selection<SVGSVGElement, unknown, null, undefined>;

if (DEV) {
  new EventSource('/esbuild').addEventListener('change', () =>
    location.reload(),
  );
}

document.addEventListener('DOMContentLoaded', async () => {
  const example = new URLSearchParams(location.search).get('example')
    ?? 'with-scan'
  $('a.' + example).classList.add('active')
  const $example = $('#example')

  if (example === 'with-scan') {
    await renderScanExample($example)
  } else {
    await renderTextOnlyExample($example)
  }
});



