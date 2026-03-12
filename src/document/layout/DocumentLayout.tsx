import React, {ReactNode, useState} from 'react';
import {Pane, SplitPane} from 'react-split-pane';
import {Splitter} from './Splitter';
import {useLayoutDirection} from './useLayoutDirection';

type DocumentLayoutProps = {
  children: [ReactNode, ReactNode];
};

const splitterThickness = {
  horizontalLayout: 10,
  verticalLayout: 16,
};
const defaultMinSize = '20%';
const defaultLayoutBreakpoint = 1024;
const defaultPaneSizes: (string | number)[] = ['50%', '50%'];

export function DocumentLayout({children}: DocumentLayoutProps) {
  const direction = useLayoutDirection(defaultLayoutBreakpoint);
  const [paneSizes, setPaneSizes] = useState(defaultPaneSizes);
  const [isActive, setIsActive] = useState(false);

  return (
    <SplitPane
      direction={direction}
      dividerSize={direction === 'horizontal'
        ? splitterThickness.horizontalLayout
        : splitterThickness.verticalLayout
      }
      onResize={(newSizes) => setPaneSizes(newSizes)}
      onResizeStart={() => setIsActive(true)}
      onResizeEnd={() => setIsActive(false)}
      divider={({isDragging, currentSize, minSize, maxSize, ...props}) =>
        <Splitter
          {...props}
          direction={direction}
          isActive={isActive}
          onDoubleClick={() => setPaneSizes(defaultPaneSizes)}
          style={direction === 'horizontal'
            ? {width: splitterThickness.horizontalLayout, height: '100%'}
            : {width: '100%', height: splitterThickness.verticalLayout}
          }
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