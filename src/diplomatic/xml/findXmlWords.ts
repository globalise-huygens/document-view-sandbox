import {XmlElement} from "@rgrove/parse-xml";
import {assertXmlElement} from "./assertXmlElement";
import {assertXmlText} from "./assertXmlText";

export function findXmlWords(
  regions: (XmlElement['children'])
): { text: string, points: string }[] {
  const $found = [];
  for (const region of regions) {
    assertXmlElement(region);
    const lines = region.children.filter((x) => x["name"] === "TextLine");
    for (const line of lines) {
      assertXmlElement(line);
      const words = line.children.filter((x) => x["name"] === "Word");
      for (const word of words) {
        assertXmlElement(word);
        const coords = word.children.find((x) => x["name"] === "Coords");
        assertXmlElement(coords);
        const points = coords.attributes["points"];
        const textEquiv = word.children.find(
          (x) => x["name"] === "TextEquiv",
        );
        assertXmlElement(textEquiv);
        const unicode = textEquiv.children.find(
          (x) => x["name"] === "Unicode",
        );
        assertXmlElement(unicode);
        const textChild = unicode.children[0];
        assertXmlText(textChild);
        const text = textChild.text;
        $found.push({text, points});
      }
    }
  }
  return $found;
}