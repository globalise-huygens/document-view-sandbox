import {Annotation} from "../AnnoModel";
import {Id} from "../Id";

export function renderAnnotationDropdown(
  $parent: HTMLElement,
  placeholder: string,
  options: Annotation[],
  toLabel: (a: Annotation) => string,
  onSelect: (id: Id) => void
) {
  const $select = document.createElement('select');
  $parent.appendChild($select);

  const $placeholder = document.createElement('option');
  $placeholder.value = '';
  $placeholder.textContent = placeholder;
  $placeholder.disabled = true;
  $placeholder.selected = true;
  $select.appendChild($placeholder);

  Object.values(options).forEach((annotation) => {
    const $option = document.createElement('option');
    $option.value = annotation.id;
    $option.textContent = toLabel(annotation);
    $select.appendChild($option);
  });

  $select.addEventListener('change', () => {
    const id = $select.value;
    $select.selectedIndex = 0;
    onSelect(id)
  })

}