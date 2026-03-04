import React, { ReactNode, useCallback } from 'react';
import { Group, Panel, useGroupRef } from 'react-resizable-panels';
import { ResizeHandle } from './ResizeHandle';
import {useLayoutDirection} from "./useLayoutDirection";

type DocumentLayoutProps = {
  children: [ReactNode, ReactNode];
};

export function DocumentLayout({ children }: DocumentLayoutProps) {
  const groupRef = useGroupRef();
  const direction = useLayoutDirection(1024);

  const facsimile = "facsimile";
  const transcription = "transcription";

  if(children.length !== 2) {
    throw new Error('Expected two child components')
  }

  const handleDoubleClick = useCallback(() => {
    groupRef.current?.setLayout({
      [facsimile]: 50,
      [transcription]: 50,
    });
  }, [groupRef.current]);

  return (
    <Group orientation={direction} groupRef={groupRef}>
      <Panel id={facsimile} defaultSize="50%" minSize="20%">
        {children[0]}
      </Panel>
      <ResizeHandle onDoubleClick={handleDoubleClick} direction={direction} />
      <Panel id={transcription} defaultSize="50%" minSize="20%">
        {children[1]}
      </Panel>
    </Group>
  );
}