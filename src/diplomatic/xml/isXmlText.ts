import { XmlText } from "@rgrove/parse-xml";

export const isXmlText = (el: any): el is XmlText => el instanceof XmlText;
