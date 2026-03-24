import {ReactNode, useState} from "react";
import { HeaderContext } from "./HeaderContext";

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