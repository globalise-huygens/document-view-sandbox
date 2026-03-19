import {useContext} from "react";
import {HeaderContext} from "./HeaderContext.tsx";

export function useControlsMode() {
  return useContext(HeaderContext).controlsMode;
}