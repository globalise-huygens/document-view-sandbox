export const adjustOpacity = (
  $view: HTMLElement,
  $scan: HTMLElement,
  $slider: HTMLInputElement,
) => {
  const opacity = parseInt($slider.value);
  $scan.style.opacity = `${opacity}%`;
  $view.style.opacity = `${100 - opacity}%`;
};
