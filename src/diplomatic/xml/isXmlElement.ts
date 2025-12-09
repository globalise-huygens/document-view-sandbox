import { XmlElement } from "@rgrove/parse-xml";

export const isXmlElement = (el: any): el is XmlElement =>
  el instanceof XmlElement;
