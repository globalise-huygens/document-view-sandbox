import React from 'react';
import {Id} from '@globalise/common/annotation';
import {useTextGranularity} from '@globalise/common/document';
import {useIsSelectedInTranscription} from '@globalise/common/document';
import {SegmentedLine} from './SegmentedLine';
import {LineSegments} from './useLineSegments';

import './NormalizedLayout.css';

type Props = {
  lineSegments: LineSegments;
};

export const NormalizedLayout = React.memo(function NormalizedLayout(
  {lineSegments}: Props,
) {
  const {pageText, segmentsByLine} = lineSegments;
  const {blockToLines} = useTextGranularity();

  let lineNumber = 0;
  return (
    <div className="normalized-view">
      <div className="text">
        {Object.entries(blockToLines).map(([blockId, lineIds]) => (
          <BlockGroup
            key={blockId}
            blockId={blockId}
            lineIds={lineIds}
            segmentsByLine={segmentsByLine}
            pageText={pageText}
            lineNumberStart={lineNumber + 1}
            onLineNumberAdvance={(count) => { lineNumber += count; }}
          />
        ))}
      </div>
    </div>
  );
});

type BlockGroupProps = {
  blockId: Id;
  lineIds: Id[];
  segmentsByLine: LineSegments['segmentsByLine'];
  pageText: string;
  lineNumberStart: number;
  onLineNumberAdvance: (count: number) => void;
};

function BlockGroup(
  {blockId, lineIds, segmentsByLine, pageText, lineNumberStart, onLineNumberAdvance}: BlockGroupProps,
) {
  const isSelected = useIsSelectedInTranscription(blockId);

  let count = 0;
  onLineNumberAdvance(count);

  return (
    <div className={`block-group ${isSelected ? 'selected' : ''}`}>
      {lineIds.map((lineId) => {
        const segments = segmentsByLine[lineId];
        if (!segments) {
          return null;
        }
        count++;
        return (
          <SegmentedLine
            key={lineId}
            lineNumber={lineNumberStart + count - 1}
            blockId={blockId}
            pageText={pageText}
            segments={segments}
          />
        );
      })}
    </div>
  );
}