import {XmlElement} from "@rgrove/parse-xml";
import {renderWord} from "./renderWord";
import {D3Svg} from "./index";
import {Benchmark} from "./Benchmark";
import {TextResizer} from "./TextResizer";
import {findXmlWords} from "./xml/findXmlWords";
import {IiifAnnotationPage} from "./AnnoModel";

export function renderAnnoText(
  page: XmlElement,
  annoPage: IiifAnnotationPage,
  scale: number,
  $text: HTMLElement,
  $boundaries: D3Svg,
) {
  const resizeTextBench = new Benchmark(TextResizer.name);
  const resizer = new TextResizer();
  const regions = page.children.filter((x) => x["name"] === "TextRegion");

  // TODO: use annoPage istead of page

  const $words = findXmlWords(regions)
    .map(({text, points}) => {
      return renderWord(text, points, $text, $boundaries, scale);
    });

  resizeTextBench.run(() => {
    resizer.calibrate($words.slice(0, 10));
    $words.forEach((word) => resizer.resize(word));
  });

}
