import { XmlElement } from "@rgrove/parse-xml";
import { isXmlElement } from "./isXmlElement";

export function assertXmlElement(el: unknown): asserts el is XmlElement {
  if (!isXmlElement(el)) {
    throw new Error("Expected XmlElement");
  }
}
