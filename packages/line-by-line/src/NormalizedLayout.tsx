import {Annotation, Id, useTextGranularity} from '@globalise/common/annotation';
import {SegmentedLine} from './SegmentedLine';
import {LineSegments} from './useLineSegments';

import './NormalizedLayout.css';

type Props = {
  lineSegments: LineSegments;
  annotations: Record<Id, Annotation>;
  selected: Id[];
  onHover: (id: Id | null) => void;
  onClick: (id: Id) => void;
};

export function NormalizedLayout(
  {lineSegments, annotations, selected, onHover, onClick}: Props,
) {
  const {pageText, segmentsByLine} = lineSegments;
  const {blockToLines} = useTextGranularity();

  const selectedBlockIds = selected
    .filter(id => annotations[id]?.textGranularity === 'block');

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
              {lineIds.map((lineId, i) => {
                const segments = segmentsByLine[lineId];
                if (!segments) {
                  return null;
                }
                return (
                  <SegmentedLine
                    key={lineId}
                    lineNumber={i + 1}
                    blockId={blockId}
                    pageText={pageText}
                    segments={segments}
                    selected={selected}
                    onHover={onHover}
                    onClick={onClick}
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