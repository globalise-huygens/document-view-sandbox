import { parseXml, XmlElement } from "@rgrove/parse-xml";
import { isXmlElement } from "./isXmlElement";

export function findXmlPage(body: string): XmlElement {
  const xml = parseXml(body);
  const doc = xml.children[0];
  if (!isXmlElement(doc)) {
    throw new Error("Expected XmlElement");
  }
  const page = doc.children.filter((x) => x["name"] === "Page")[0];
  if (!isXmlElement(page)) {
    throw new Error("Expected XmlElement");
  }
  return page;
}
