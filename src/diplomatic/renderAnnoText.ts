import {renderWord, Word} from "./renderWord";
import {Benchmark} from "./Benchmark";
import {TextResizer} from "./TextResizer";
import {IiifAnnotationPage} from "./AnnoModel";
import {findWordAnnotations} from "./anno/findWordAnnotations";

export function renderAnnoText(
  page: IiifAnnotationPage,
  scale: number,
  $text: HTMLElement,
): { words: Word[] } {
  const resizeTextBench = new Benchmark(TextResizer.name);
  const resizer = new TextResizer();

  const annotations = findWordAnnotations(page);
  console.log("Word annotations:", annotations);
  const words = annotations.map(({text, points}) =>
    renderWord(text, points, $text, scale)
  );

  resizeTextBench.run(() => {
    const elements = words.map(({el}) => el)
    resizer.calibrate(elements.slice(0, 10));
    elements.forEach((word) => resizer.resize(word));
  });
  return {words}
}
