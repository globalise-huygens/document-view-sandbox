/**
 * Inspiration: https://dev.to/jankapunkt/make-text-fit-it-s-parent-size-using-javascript-m40
 */
export const resizeText = (el: HTMLElement, minSize = 1, maxSize = 150, step = 1, unit = "px") => {
  {
    let i = minSize;
    let overflow = false;

    const parent = el.parentNode as HTMLElement;

    while (!overflow && i < maxSize) {
      el.style.fontSize = `${i}${unit}`;
      overflow = isOverflown(parent);

      if (!overflow) {
        i += step;
      }
    }

    // revert to last state where no overflow happened
    el.style.fontSize = `${i - step}${unit}`;

    // adjust the vertical positioning after the horizontal scaling of the font.
    const verticalAdjust = parent.clientHeight / 2 - el.clientHeight / 2;
    el.style.marginTop = `${verticalAdjust}${unit}`;
  }
};

const isOverflown = ({clientWidth, scrollWidth}) => scrollWidth > clientWidth;

