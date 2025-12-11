// renderAnnoText.ts (UPDATED)
import {XmlElement} from "@rgrove/parse-xml";
import {renderWord} from "./renderWord";
import {D3Svg} from "./index";
import {Benchmark} from "./Benchmark";
import {TextResizer} from "./TextResizer";
import {IiifAnnotationPage} from "./AnnoModel";
import {findAnnoWords} from "./anno/findAnnoWords";

export function renderAnnoText(
  page: IiifAnnotationPage,
  scale: number,
  $text: HTMLElement,
  $boundaries: D3Svg,
) {
  const resizeTextBench = new Benchmark(TextResizer.name);
  const resizer = new TextResizer();

  const words = findAnnoWords(page);
  console.log('words', words)
  const $words = words
    .map(({text, points}) => {
      return renderWord(text, points, $text, $boundaries, scale);
    });

  resizeTextBench.run(() => {
    resizer.calibrate($words.slice(0, 10));
    $words.forEach((word) => resizer.resize(word));
  });
}