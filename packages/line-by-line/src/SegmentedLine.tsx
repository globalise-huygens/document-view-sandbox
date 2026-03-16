import {TextSegment} from '@knaw-huc/text-annotation-segmenter';
import {Annotation, Id} from '@globalise/common/annotation';
import {AnnotationSegment} from './AnnotationSegment';
import {NestedSegment} from './NestedSegment.tsx';

type Props = {
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
  }: Props,
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
        {segments.map(segment => {
          const body = pageText.slice(segment.begin, segment.end);
          return (
            <NestedSegment
              key={segment.id}
              annotations={segment.annotations}
              annotation={(annotation, children) => (
                <AnnotationSegment
                  annotation={annotation}
                  selected={selected}
                  onClick={onClick}
                  onHover={(id) => {
                    if (id) {
                      onHover(id);
                    }
                  }}
                >
                  {children}
                </AnnotationSegment>
              )}
            >
              {body}
            </NestedSegment>
          );
        })}
      </span>
    </span>
  );
}