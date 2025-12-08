import {debounce} from "lodash";

/**
 * Inspiration: https://dev.to/jankapunkt/make-text-fit-it-s-parent-size-using-javascript-m40
 */
export class TextResizer {
  private isOverflownCount = 0

  private sampleCount = 0;

  constructor(
    private precision = 3,
    private charToWidthFactor = 0.6
  ) {
  }

  public resize = (el: HTMLElement) => {
    const parent = el.parentNode as HTMLElement;
    const charCount = el.textContent?.length || 0
    if(!charCount) return;
    const width = parent.clientWidth;

    const predicted = this.calcWidth(width, charCount);
    let low = predicted * 0.9;
    let high = predicted * 1.1;

    el.style.fontSize = `${predicted}px`;
    if (this.isOverflown(parent)) {
      high = predicted - 1;
    } else {
      low = predicted + 1;
    }

    let mid = low;
    while (low <= high) {
      if (high - low < this.precision) {
        mid = low;
        break;
      }
      const i = Math.floor((low + high) / 2);
      el.style.fontSize = `${i}px`;

      if (this.isOverflown(parent)) {
        high = i - 1;
      } else {
        mid = i;
        low = i + 1;
      }
    }

    el.style.fontSize = `${mid}px`;
    this.calcFactor(width, charCount, mid);

    // adjust the vertical positioning after the horizontal scaling of the font.
    const verticalAdjust = parent.clientHeight / 2 - el.clientHeight / 2;
    el.style.marginTop = `${verticalAdjust}px`;
  };

  private calcFactor(
    width: number,
    charCount: number,
    finalFontSize: number
  ) {
    const factorUpdate = width / (charCount * finalFontSize);
    const sampleCountUpdate = this.sampleCount + 1;
    this.charToWidthFactor = (this.charToWidthFactor * this.sampleCount + factorUpdate) / sampleCountUpdate;
    this.sampleCount = sampleCountUpdate;
  }

  private calcWidth(width: number, charCount: number) {
    return Math.round(width / (charCount * this.charToWidthFactor));
  }

  private isOverflown = ({clientWidth, scrollWidth}) => {
    this.isOverflownCount++
    this.printOverflownCount()
    return scrollWidth > clientWidth;
  };

  private printOverflownCount = debounce(() => {
    console.log('isOverflownCount:', this.isOverflownCount)
  }, 1000)

}

