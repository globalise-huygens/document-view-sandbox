import {px} from "./px";

type ImgAttributes = {
  scanPath: string,
  width: number,
  height: number
};

export function renderScan(
  img: ImgAttributes,
  scale: number,
  $scan: HTMLImageElement,
) {
  $scan.innerHTML = ''
  const {scanPath, width, height} = img;
  $scan.src = scanPath;
  Object.assign($scan.style, {
    width: px(scale * width),
    height: px(scale * height),
    borderStyle: 'none',
    zIndex: -1,
    position: 'absolute',
    top:0,
    left: 0,
  })
}
