import { debounce } from "lodash";

/**
 * Inspiration: https://dev.to/jankapunkt/make-text-fit-it-s-parent-size-using-javascript-m40
 */
export class TextResizer {
  private isOverflownCount = 0;

  private sampleCount = 0;

  constructor(
    private precision = 3,
    private charToWidthFactor = 1,
  ) {}

  public calibrate(elements: HTMLElement[]): void {
    for (const element of elements) {
      const parent = element.parentNode as HTMLElement;
      const charCount = element.textContent?.length || 0;
      if (!charCount) {
        continue;
      }
      const width = parent.clientWidth;
      const predicted = this.calcWidth(width, charCount);
      const finalSize = this.binarySearch(element, parent, predicted);
      this.updateFactor(width, charCount, finalSize);
    }
    console.log(
      "Calibrated, new char-to-width factor:",
      this.charToWidthFactor,
    );
  }

  public resize = (el: HTMLElement) => {
    const parent = el.parentNode as HTMLElement;
    const charCount = el.textContent?.length;
    if (!charCount) return;
    const width = parent.clientWidth;

    const predicted = this.calcWidth(width, charCount);
    el.style.fontSize = `${predicted}px`;

    // adjust the vertical positioning after the horizontal scaling of the font.
    const verticalAdjust = parent.clientHeight / 2 - el.clientHeight / 2;
    el.style.marginTop = `${verticalAdjust}px`;
  };

  private binarySearch(
    el: HTMLElement,
    parent: HTMLElement,
    predicted: number,
  ): number {
    el.style.fontSize = `${predicted}px`;
    let low = predicted * 0.5;
    let high = predicted * 1.5;

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
    return mid;
  }

  private updateFactor(
    width: number,
    charCount: number,
    finalFontSize: number,
  ) {
    const factorUpdate = width / (charCount * finalFontSize);
    const sampleCountUpdate = this.sampleCount + 1;
    this.charToWidthFactor =
      (this.charToWidthFactor * this.sampleCount + factorUpdate) /
      sampleCountUpdate;
    this.sampleCount = sampleCountUpdate;
  }

  private calcWidth(width: number, charCount: number) {
    return Math.round(width / (charCount * this.charToWidthFactor));
  }

  private isOverflown = ({ clientWidth, scrollWidth }) => {
    this.isOverflownCount++;
    this.printOverflownCount();
    return scrollWidth > clientWidth;
  };

  private printOverflownCount = debounce(() => {
    console.log("isOverflownCount:", this.isOverflownCount);
  }, 1000);
}
