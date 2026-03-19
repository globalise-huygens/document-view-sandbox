import {createContext, useContext} from 'react';
import {noop} from '../util/noop.ts';

type HeaderBarRegions = {
  left: HTMLDivElement | null;
  center: HTMLDivElement | null;
  right: HTMLDivElement | null;
  setLeft: (el: HTMLDivElement | null) => void;
  setCenter: (el: HTMLDivElement | null) => void;
  setRight: (el: HTMLDivElement | null) => void;
  controlsMode: 'inline' | 'header';
};

export const HeaderContext = createContext<HeaderBarRegions>({
  controlsMode: 'header',
  left: null,
  center: null,
  right: null,
  setLeft: noop,
  setCenter: noop,
  setRight: noop,
});

export type HeaderRegions = 'left' | 'center' | 'right';

export function useHeaderRegion(region: HeaderRegions) {
  const regions = useContext(HeaderContext);
  return regions[region];
}

