import {Id} from "./Id";

export type View = {
  hide: () => void
  show: () => void
  selectAnnotation: (id: Id) => void,
  deselectAnnotation: (id: Id) => void
}