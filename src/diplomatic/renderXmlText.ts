import {XmlElement} from "@rgrove/parse-xml";
import {renderWord} from "./renderWord";
import {D3Svg} from "./index";
import {Benchmark} from "./Benchmark";
import {TextResizer} from "./TextResizer";
import {findXmlWords} from "./xml/findXmlWords";

export function renderXmlText(
  page: XmlElement,
  scale: number,
  $text: HTMLElement,
  $boundaries: D3Svg,
) {
  const resizeTextBench = new Benchmark(TextResizer.name);
  const resizer = new TextResizer();
  const regions = page.children.filter((x) => x["name"] === "TextRegion");

  const $words = findXmlWords(regions)
    .map(({text, points}) => renderWord(text, points, $text, $boundaries, scale));

  resizeTextBench.run(() => {
    resizer.calibrate($words.slice(0, 10));
    $words.forEach((word) => resizer.resize(word));
  });

}
