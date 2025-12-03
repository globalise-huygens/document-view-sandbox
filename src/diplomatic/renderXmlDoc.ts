import {parseXml} from "@rgrove/parse-xml";
import {isXmlElement} from "./isXmlElement";
import {assertXmlElement} from "./assertXmlElement";
import {assertXmlText} from "./assertXmlText";
import {renderWord} from "./renderWord";
import {D3Svg} from "./index";

export function renderXmlDoc(
  body: string,
  scale: number,
  $text: HTMLElement,
  $boundaries: D3Svg,
  $scan: HTMLImageElement,
  dir: string

) {
  const xml = parseXml(body);
  const doc = xml.children[0];
  if (!isXmlElement(doc)) {
    throw new Error("Expected XmlElement")
  }
  const page = doc.children.filter((x) => x["name"] === "Page")[0];
  if (!isXmlElement(page)) {
    throw new Error("Expected XmlElement")
  }
  const {imageFilename, imageWidth, imageHeight} = page.attributes;
  const imageStyle = `
      position: absolute;
      left: 0;
      top: 0;
      width: ${scale * parseInt(imageWidth)}px;
      height: ${scale * parseInt(imageHeight)}px;
      border-style: none;
      z-index: -1;
    `;
  const bodyStyle = `
      position: absolute;
      left: 0;
      top: 0;
      width: ${scale * parseInt(imageWidth)}px;
      height: ${scale * parseInt(imageHeight)}px;
    `;

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

  $scan.src = `/images/${dir}/${imageFilename}`;
  $scan.style.cssText = imageStyle;
  const bodyEl = document.getElementsByTagName("body")[0];
  bodyEl.style.cssText = bodyStyle;
}