import {ReactNode, useState} from 'react';
import {HeaderContext} from './HeaderContext';

export function HeaderProvider({children}: {children: ReactNode}) {
  const [left, setLeft] = useState<HTMLDivElement | null>(null);
  const [center, setCenter] = useState<HTMLDivElement | null>(null);
  const [right, setRight] = useState<HTMLDivElement | null>(null);

  return (
    <HeaderContext.Provider value={{
      left, setLeft,
      center, setCenter,
      right, setRight,
    }}>
      {children}
    </HeaderContext.Provider>
  );
}