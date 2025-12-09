export const adjustOpacity = (
  $view: HTMLElement,
  $scan: HTMLImageElement,
  $slider: HTMLInputElement,
) => {
  const opacity = parseInt($slider.value);
  $scan.style.opacity = `${opacity}%`;
  $view.style.opacity = `${100 - opacity}%`;
};
