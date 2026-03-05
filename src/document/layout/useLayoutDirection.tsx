import {useState, useEffect} from 'react';

export type Direction = 'horizontal' | 'vertical';

export function useLayoutDirection(breakpoint: number): Direction {

  const [direction, setDirection] = useState<Direction>(() => {
    const width = window.innerWidth;
    return width <= breakpoint
      ? 'vertical'
      : 'horizontal';
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia(`(max-width: ${breakpoint}px)`);

    const handleChange = (e: MediaQueryListEvent) => {
      const direction = e.matches
        ? 'vertical'
        : 'horizontal';
      setDirection(direction);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [breakpoint]);

  return direction;
}