import {ReactNode} from "react";
import {createPortal} from "react-dom";
import {HeaderRegions, useHeaderRegion} from "./HeaderContext.tsx";

export function HeaderRegion({region, children}: {
  region: HeaderRegions;
  children: ReactNode;
}) {
  const target = useHeaderRegion(region);
  if (!target) {
    return null;
  }
  return createPortal(children, target);
}