import {px} from "./px";

type ImgAttributes = {
  imageFilename: string,
  width: number,
  height: number
};

export function renderScan(
  img: ImgAttributes,
  scale: number,
  $scan: HTMLImageElement,
  dir: string,
) {
  $scan.innerHTML = ''
  const {imageFilename, width, height} = img;
  $scan.src = `/images/${dir}/${imageFilename}`;
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
