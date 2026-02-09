import {Id} from "../Id";

export type ViewRef = {
  selectAnnotation: (id: Id) => void;
  deselectAnnotation: (id: Id) => void;
};