import {Id} from "@globalise/common/annotation";

export type View = {
  setSelected: (...ids: Id[]) => void
}