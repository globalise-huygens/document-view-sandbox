import React, {useMemo} from 'react';
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
  const {segmentsByLine} = lineSegments;
  const {blockToLines} = useTextGranularity();

  const blockEntries = useMemo(() => Object.entries(blockToLines), [blockToLines]);

  const blockLineNumberStarts = useMemo(() => {
    const starts: number[] = [];
    let count = 0;
    for (const [, lineIds] of blockEntries) {
      starts.push(count);
      count += lineIds.filter((id) => segmentsByLine[id]).length;
    }
    return starts;
  }, [blockEntries, segmentsByLine]);

  return (
    <div className="normalized-view">
      <div className="text">
        {blockEntries.map(([blockId, lineIds], i) => (
          <BlockGroup
            key={blockId}
            blockId={blockId}
            lineIds={lineIds}
            segmentsByLine={segmentsByLine}
            lineNumberStart={blockLineNumberStarts[i] + 1}
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
  lineNumberStart: number;
};

function BlockGroup(
  {blockId, lineIds, segmentsByLine, lineNumberStart}: BlockGroupProps,
) {
  const isSelected = useIsSelectedInTranscription(blockId);

  let count = 0;

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
            lineId={lineId}
            lineNumber={lineNumberStart + count - 1}
            blockId={blockId}
            segments={segments}
          />
        );
      })}
    </div>
  );
}