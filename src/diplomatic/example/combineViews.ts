import {View} from "../View";
import {Id} from "../Id";

export type CombinedView = {
  toggle: () => void,
  toggleAnnotation: (id: Id) => void
} & Omit<View, 'hide' | 'show'>

export function combineViews(
  views: Record<string, View>
): CombinedView {

  const viewNames = Object.keys(views)
  let currentIndex = 0

  function toggle() {
    views[viewNames[currentIndex]].hide()
    currentIndex = nextIndex(currentIndex, viewNames.length)
    views[viewNames[currentIndex]].show()
  }

  function selectAnnotation(id: Id) {
    Object.values(views).forEach(v => v.selectAnnotation(id))
  }

  function deselectAnnotation(id: Id) {
    Object.values(views).forEach(v => v.deselectAnnotation(id))
  }

  const selectedAnnotations: Set<Id> = new Set()
  function toggleAnnotation(id: Id) {
    if (selectedAnnotations.has(id)) {
      deselectAnnotation(id)
      selectedAnnotations.delete(id)
    } else {
      selectAnnotation(id);
      selectedAnnotations.add(id)
    }
  }

  return {
    toggle,
    selectAnnotation,
    deselectAnnotation,
    toggleAnnotation
  }
}

function nextIndex(current: number, length: number): number {
  return (current + 1) % length
}