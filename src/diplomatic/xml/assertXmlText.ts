import {XmlText} from "@rgrove/parse-xml";

import {isXmlText} from "./isXmlText";

export function assertXmlText(el: unknown): asserts el is XmlText {
  if (!isXmlText(el)) {
    throw new Error("Expected XmlText");
  }
}