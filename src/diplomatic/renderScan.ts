import {XmlElement} from "@rgrove/parse-xml";
import {px} from "./px";

export function renderScan(
  page: XmlElement,
  scale: number,
  $scan: HTMLImageElement,
  dir: string,
) {
  $scan.innerHTML = ''
  const {imageFilename, imageWidth, imageHeight} = page.attributes;
  $scan.src = `/images/${dir}/${imageFilename}`;
  Object.assign($scan.style, {
    width: px(scale * parseInt(imageWidth)),
    height: px(scale * parseInt(imageHeight)),
    borderStyle: 'none',
    zIndex: -1,
    position: 'absolute',
    top:0,
    left: 0,
  })
}
