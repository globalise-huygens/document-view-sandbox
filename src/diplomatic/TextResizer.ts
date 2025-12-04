import {debounce} from "lodash";

/**
 * Inspiration: https://dev.to/jankapunkt/make-text-fit-it-s-parent-size-using-javascript-m40
 */
export class TextResizer {
  private prevFontsize: number | null = null;
  private isOverflownCount = 0

  public resize = (el: HTMLElement, minSize = 1, maxSize = 150, step = 1) => {
    let i = minSize;
    let overflow = false;
    let direction: 'asc' | 'desc' = 'asc';
    const parent = el.parentNode as HTMLElement;
    if(this.prevFontsize) {
      i = this.prevFontsize
      el.style.fontSize = `${i}px`;
      overflow = this.isOverflown(parent)
      if (overflow) {
        direction = 'desc'
      }
    }

    let finalFontSize;
    if (direction === 'desc') {
      while (overflow && i > 0) {
        el.style.fontSize = `${i}px`;
        overflow = this.isOverflown(parent);
        if (overflow) {
          i -= step;
        }
      }
      finalFontSize = i;
    } else {
      while (!overflow && i < maxSize) {
        el.style.fontSize = `${i}px`;
        overflow = this.isOverflown(parent);
        if (!overflow) {
          i += step;
        }
        this.isOverflownCount++
      }
      finalFontSize = i - step;
    }

    // revert to last state where no overflow happened
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

