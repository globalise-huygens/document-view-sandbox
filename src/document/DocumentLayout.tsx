import React, {ReactNode, useCallback} from 'react';
import {Group, Panel, useGroupRef} from 'react-resizable-panels';
import {ResizeHandle} from './ResizeHandle';

type DocumentLayoutProps = {
  children: [ReactNode, ReactNode];
};

export function DocumentLayout({children}: DocumentLayoutProps) {
  const groupRef = useGroupRef();

  const facsimile = "facsimile"
  const transcription = "transcription"

  const handleDoubleClick = useCallback(() => {
    groupRef.current?.setLayout({
      [facsimile]: 50,
      [transcription]: 50,
    });
  }, [groupRef.current]);

  return (
    <Group orientation="horizontal" groupRef={groupRef}>
      <Panel id={facsimile} defaultSize={50} minSize={20}>
        {children[0]}
      </Panel>
      <ResizeHandle onDoubleClick={handleDoubleClick} />
      <Panel id={transcription} defaultSize={50} minSize={20}>
        {children[1]}
      </Panel>
    </Group>
  );
}