import {TextSegment} from '@knaw-huc/text-annotation-segmenter';
import {Annotation, Id} from '@globalise/common/annotation';
import {setHovered} from '@globalise/common/DocumentStore';
import {SegmentedText} from './SegmentedText';

type LineProps = {
  lineNumber: number;
  blockId: Id | null;
  pageText: string;
  segments: TextSegment<Annotation>[];
  selected: Id[];
};

export function SegmentedLine(
  {lineNumber, blockId, pageText, segments, selected}: LineProps,
) {
  return (
    <span
      className="line"
      onMouseEnter={() => {
        if (blockId) {
          setHovered(blockId);
        }
      }}
      onMouseLeave={() => setHovered(null)}
    >
      <span className="line-number">
        {`${lineNumber}`.padStart(2, ' ')}
      </span>
      <span className="line-content">
        <SegmentedText
          blockId={blockId}
          pageText={pageText}
          segments={segments}
          selected={selected}
        />
      </span>
    </span>
  );
}