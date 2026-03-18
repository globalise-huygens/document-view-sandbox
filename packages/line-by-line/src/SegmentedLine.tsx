import {TextSegment} from '@knaw-huc/text-annotation-segmenter';
import {Annotation, Id} from '@globalise/common/annotation';
import {SegmentedText} from "./SegmentedText.tsx";

type LineProps = {
  lineNumber: number;
  blockId: Id | null;
  pageText: string;
  segments: TextSegment<Annotation>[];
  selected: Id[];
  onHover: (id: Id | null) => void;
  onClick: (id: Id) => void;
};

export function SegmentedLine(
  {
    lineNumber,
    blockId,
    pageText,
    segments,
    selected,
    onHover,
    onClick,
  }: LineProps,
) {
  return (
    <span
      className="line"
      onMouseEnter={() => {
        if (blockId) {
          onHover(blockId);
        }
      }}
      onMouseLeave={() => onHover(null)}
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
          onHover={onHover}
          onClick={onClick}
        />
      </span>
    </span>
  );
}