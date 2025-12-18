import {orThrow} from "../../util/orThrow";

export function $<T extends HTMLElement>(
  selector: string,
  parent: HTMLElement | Document = document
): T {
  return parent.querySelector(selector) ?? orThrow(`${selector} not found`);
}