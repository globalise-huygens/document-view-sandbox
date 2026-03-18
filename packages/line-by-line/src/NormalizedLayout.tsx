import {Annotation, Id, useTextGranularity} from '@globalise/common/annotation';
import {SegmentedLine} from './SegmentedLine';
import {LineSegments} from './useLineSegments';

import './NormalizedLayout.css';

type Props = {
  lineSegments: LineSegments;
  annotations: Record<Id, Annotation>;
  selected: Id[];
};

export function NormalizedLayout(
  {lineSegments, annotations, selected}: Props,
) {
  const {pageText, segmentsByLine} = lineSegments;
  const {blockToLines} = useTextGranularity();

  const selectedBlockIds = selected
    .filter(id => annotations[id]?.textGranularity === 'block');

  let lineNumber = 0;
  return (
    <div className="normalized-view">
      <div className="text">
        {Object.entries(blockToLines).map(([blockId, lineIds]) => {
          const isSelected = selectedBlockIds.includes(blockId);
          return (
            <div
              key={blockId}
              className={`block-group ${isSelected ? 'selected' : ''}`}
            >
              {lineIds.map((lineId) => {
                const segments = segmentsByLine[lineId];
                if (!segments) {
                  return null;
                }
                return (
                  <SegmentedLine
                    key={lineId}
                    lineNumber={++lineNumber}
                    blockId={blockId}
                    pageText={pageText}
                    segments={segments}
                    selected={selected}
                  />
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}