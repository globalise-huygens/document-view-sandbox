import {Annotation} from "../AnnoModel";
import {Id} from "../Id";

export function renderAnnotationDropdown(
  $parent: HTMLElement,
  placeholder: string,
  options: Annotation[],
  toLabel: (a: Annotation) => string,
  onSelect: (id: Id) => void
) {
  const $dropdown = document.createElement('select');
  $parent.appendChild($dropdown);

  const $placeholder = document.createElement('option');
  $placeholder.value = '';
  $placeholder.textContent = placeholder;
  $placeholder.disabled = true;
  $placeholder.selected = true;
  $dropdown.appendChild($placeholder);

  Object.values(options).forEach((annotation) => {
    const $option = document.createElement('option');
    $option.value = annotation.id;
    $option.textContent = toLabel(annotation);
    $dropdown.appendChild($option);
  });

  $dropdown.addEventListener('change', () => {
    const id = $dropdown.value;
    $dropdown.selectedIndex = 0;
    onSelect(id)
  })

}