import {Id} from "./annotation";

export type View = {
  setSelected: (...ids: Id[]) => void
}