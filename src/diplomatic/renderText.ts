import {parseXml, XmlElement} from "@rgrove/parse-xml";
import {isXmlElement} from "./isXmlElement";
import {assertXmlElement} from "./assertXmlElement";
import {assertXmlText} from "./assertXmlText";
import {renderWord} from "./renderWord";
import {D3Svg} from "./index";

export function renderText(
  page: XmlElement,
  scale: number,
  $text: HTMLElement,
  $boundaries: D3Svg
) {
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
        renderWord(text, points, $text, $boundaries, scale);
      }
    }
  }
}