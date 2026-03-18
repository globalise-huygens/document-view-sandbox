import {createContext, ReactNode, useContext, useState} from 'react';
import {noop} from "./util/noop.ts";

type HeaderBarRegions = {
  left: HTMLDivElement | null;
  center: HTMLDivElement | null;
  right: HTMLDivElement | null;
  setLeft: (el: HTMLDivElement | null) => void;
  setCenter: (el: HTMLDivElement | null) => void;
  setRight: (el: HTMLDivElement | null) => void;
  controlsMode: 'inline' | 'header';
};

const HeaderContext = createContext<HeaderBarRegions>({
  controlsMode: 'header',
  left: null,
  center: null,
  right: null,
  setLeft: noop,
  setCenter: noop,
  setRight: noop,
});

export {HeaderContext};

export function HeaderProvider(
  {children, controlsMode = 'header'}: {
    children: ReactNode;
    controlsMode?: 'inline' | 'header';
  }
) {
  const [left, setLeft] = useState<HTMLDivElement | null>(null);
  const [center, setCenter] = useState<HTMLDivElement | null>(null);
  const [right, setRight] = useState<HTMLDivElement | null>(null);

  return (
    <HeaderContext.Provider value={{
      left,
      center,
      right,
      setLeft,
      setCenter,
      setRight,
      controlsMode
    }}>
      {children}
    </HeaderContext.Provider>
  );
}

export type HeaderRegions = 'left' | 'center' | 'right';

export function useHeaderRegion(region: HeaderRegions) {
  const regions = useContext(HeaderContext);
  return regions[region];
}

export function useControlsMode() {
  return useContext(HeaderContext).controlsMode;
}
