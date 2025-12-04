import {debounce} from "lodash";

/**
 * Inspiration: https://dev.to/jankapunkt/make-text-fit-it-s-parent-size-using-javascript-m40
 */
export class TextResizer {
  private prevFontsize: number | null = null;
  private isOverflownCount = 0

  constructor(
    private precision = 3,
    private minSize = 1,
    private maxSize = 150
  ) {
  }

  public resize = (el: HTMLElement) => {
    const parent = el.parentNode as HTMLElement;

    let low = this.minSize;
    let high = this.maxSize;
    const startFontSize = this.prevFontsize || parseInt(el.style.fontSize);
    el.style.fontSize = `${startFontSize}px`;
    if (this.isOverflown(parent)) {
      high = startFontSize - 1;
    } else {
      low = startFontSize + 1;
    }

    let finalFontSize = low;
    while (low <= high) {
      if (high - low < this.precision) {
        finalFontSize = low;
        break;
      }
      const i = Math.floor((low + high) / 2);
      el.style.fontSize = `${i}px`;

      if (this.isOverflown(parent)) {
        high = i - 1;
      } else {
        finalFontSize = i;
        low = i + 1;
      }
    }

    el.style.fontSize = `${finalFontSize}px`;

    // adjust the vertical positioning after the horizontal scaling of the font.
    const verticalAdjust = parent.clientHeight / 2 - el.clientHeight / 2;
    el.style.marginTop = `${verticalAdjust}px`;

    this.prevFontsize = finalFontSize;
  };

  private isOverflown = ({clientWidth, scrollWidth}) => {
    this.isOverflownCount++
    this.printOverflownCount()
    return scrollWidth > clientWidth;
  };

  private printOverflownCount = debounce(() => {
    console.log('isOverflownCount:', this.isOverflownCount)
  }, 1000)

}

