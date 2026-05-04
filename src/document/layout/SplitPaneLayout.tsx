import React, {ReactNode, useCallback} from 'react';
import {DividerProps, Pane, SplitPane} from 'react-split-pane';
import {Splitter} from './Splitter';
import {useLayoutDirection} from './useLayoutDirection';
import {resetScaling, setPaneRatio, useSettings} from '../SettingsStore';
import {HeaderBar} from './Header';
import './SplitPaneLayout.css'

type DocumentLayoutProps = {
  children: [ReactNode, ReactNode];
};

const splitterThickness = {
  horizontalLayout: 10,
  verticalLayout: 16,
};
const defaultMinSize = '20%';
export const layoutBreakpoint = 1024;

export function SplitPaneLayout({children}: DocumentLayoutProps) {
  const direction = useLayoutDirection(layoutBreakpoint);
  const {paneRatio} = useSettings();
  const paneSizes = [`${paneRatio * 100}%`, `${(1 - paneRatio) * 100}%`];

  const divider = useCallback(
    (props: DividerProps) =>
      <Splitter
        {...props}
        direction={direction}
        onDoubleClick={() => resetScaling()}
        style={direction === 'horizontal'
          ? {width: splitterThickness.horizontalLayout, height: '100%'}
          : {width: '100%', height: splitterThickness.verticalLayout}
        }
      />,
    [direction]
  );

  return (
    <div className="split-pane-layout">
      <HeaderBar />
      <SplitPane
        direction={direction}
        dividerSize={direction === 'horizontal'
          ? splitterThickness.horizontalLayout
          : splitterThickness.verticalLayout
        }
        onResize={([pane1, pane2]) => {
          setPaneRatio(pane1 / (pane1 + pane2));
        }}
        divider={divider}
      >
        <Pane size={paneSizes[0]} minSize={defaultMinSize}>
          {children[0]}
        </Pane>
        <Pane size={paneSizes[1]} minSize={defaultMinSize}>
          {children[1]}
        </Pane>
      </SplitPane>
    </div>
  );
}
