import {Id} from "./Id";

export type SelectableView = {
  selectAnnotation: (id: Id) => void,
  deselectAnnotation: (id: Id) => void
}