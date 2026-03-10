import React, {ReactNode, useState} from 'react';
import {Pane, SplitPane} from 'react-split-pane';
import {Splitter} from './Splitter';
import {useLayoutDirection} from './useLayoutDirection';

type DocumentLayoutProps = {
  children: [ReactNode, ReactNode];
};

const defaultMinSize = "20%";
const defaultLayoutBreakpoint = 1024;
const defaultPaneSizes: (string | number)[] = ['49.7%', '49.7%'];

export function DocumentLayout({children}: DocumentLayoutProps) {
  const direction = useLayoutDirection(defaultLayoutBreakpoint);
  const [paneSizes, setPaneSizes] = useState(defaultPaneSizes);
  const [isActive, setIsActive] = useState(false);

  if (children.length !== 2) {
    throw new Error('Expected two child components')
  }

  return (
    <SplitPane
      direction={direction}
      onResize={(newSizes) => setPaneSizes(newSizes)}
      onResizeStart={() => setIsActive(true)}
      onResizeEnd={() => setIsActive(false)}
      divider={props => <Splitter
        {...props}
        direction={direction}
        isActive={isActive}
        onDoubleClick={() => setPaneSizes(defaultPaneSizes)}
      />}
    >
      <Pane size={paneSizes[0]} minSize={defaultMinSize}>
        {children[0]}
      </Pane>
      <Pane size={paneSizes[1]} minSize={defaultMinSize}>
        {children[1]}
      </Pane>
    </SplitPane>
  );
}