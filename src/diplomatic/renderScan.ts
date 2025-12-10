import { XmlElement } from "@rgrove/parse-xml";

export function renderScan(
  page: XmlElement,
  scale: number,
  $scan: HTMLImageElement,
  dir: string,
) {
  $scan.innerHTML = ''
  const { imageFilename, imageWidth, imageHeight } = page.attributes;
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

  $scan.src = `/images/${dir}/${imageFilename}`;
  $scan.style.cssText = imageStyle;
  const bodyEl = document.getElementsByTagName("body")[0];
  bodyEl.style.cssText = bodyStyle;
}
