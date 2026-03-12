import React, {ReactNode, useState} from 'react';
import {Pane, SplitPane} from 'react-split-pane';
import {Splitter} from './Splitter';
import {useLayoutDirection} from './useLayoutDirection';
import {useSettings, setPaneRatio} from '../SettingsStore';

type DocumentLayoutProps = {
  children: [ReactNode, ReactNode];
};

const splitterThickness = {
  horizontalLayout: 10,
  verticalLayout: 16,
};
const defaultMinSize = '20%';
export const layoutBreakpoint = 1024;

export function DocumentLayout({children}: DocumentLayoutProps) {
  const direction = useLayoutDirection(layoutBreakpoint);
  const {paneRatio} = useSettings();
  const paneSizes = [`${paneRatio * 100}%`, `${(1 - paneRatio) * 100}%`];
  const [isActive, setIsActive] = useState(false);

  return (
    <SplitPane
      direction={direction}
      dividerSize={direction === 'horizontal'
        ? splitterThickness.horizontalLayout
        : splitterThickness.verticalLayout
      }
      onResize={([pane1, pane2]) => {
        setPaneRatio(pane1 / (pane1 + pane2));
      }}
      onResizeStart={() => setIsActive(true)}
      onResizeEnd={() => setIsActive(false)}
      divider={({isDragging, currentSize, minSize, maxSize, ...props}) =>
        <Splitter
          {...props}
          direction={direction}
          isActive={isActive}
          onDoubleClick={() => setPaneRatio(0.5)}
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