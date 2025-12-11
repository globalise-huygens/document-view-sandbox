import { Selector } from "../AnnoModel";

export const isSvgSelector = (selector: any): selector is Selector =>
  selector &&
  selector.type === "SvgSelector" &&
  typeof selector.value === "string";