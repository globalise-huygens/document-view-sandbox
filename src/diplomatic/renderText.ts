import {XmlElement} from "@rgrove/parse-xml";
import {renderWord} from "./renderWord";
import {D3Svg} from "./index";
import {Benchmark} from "./Benchmark";
import {TextResizer} from "./TextResizer";
import {assertXmlElement} from "./xml/assertXmlElement";
import {assertXmlText} from "./xml/assertXmlText";

export function renderText(
  page: XmlElement,
  scale: number,
  $text: HTMLElement,
  $boundaries: D3Svg
) {
  const resizeTextBench = new Benchmark(TextResizer.name);
  const resizer = new TextResizer();
  const regions = page.children.filter((x) => x["name"] === "TextRegion");
  for (const region of regions) {
    assertXmlElement(region);
    const lines = region.children
      .filter((x) => x["name"] === "TextLine");
    for (const line of lines) {
      assertXmlElement(line);
      const words = line.children
        .filter((x) => x["name"] === "Word");
      for (const word of words) {
        assertXmlElement(word);
        const coords = word.children
          .find((x) => x["name"] === "Coords");
        assertXmlElement(coords);
        const points = coords.attributes["points"];
        const textEquiv = word.children
          .find((x) => x["name"] === "TextEquiv");
        assertXmlElement(textEquiv);
        const unicode = textEquiv.children
          .find((x) => x["name"] === "Unicode");
        assertXmlElement(unicode);
        const textChild = unicode.children[0];
        assertXmlText(textChild);
        const text = textChild.text;
        const $word = renderWord(text, points, $text, $boundaries, scale);
        resizeTextBench.run(() => resizer.resize($word));
      }
    }
  }
}

