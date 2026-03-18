import {NestedSegment} from "./NestedSegment.tsx";
import {AnnotationSegment} from "./AnnotationSegment.tsx";
import {Annotation, Id, isEntity, isWord} from "@globalise/common/annotation";
import {TextSegment} from "@knaw-huc/text-annotation-segmenter";

type TextProps = {
  blockId: Id | null;
  pageText: string;
  segments: TextSegment<Annotation>[];
  selected: Id[];
  onHover: (id: Id | null) => void;
  onClick: (id: Id) => void;
};

export function SegmentedText(
  {blockId, pageText, segments, selected, onHover, onClick}: TextProps
) {
  return <>
    {segments.map(segment => {
      const body = pageText.slice(segment.begin, segment.end);
      const selectedId = selectAnnotation(segment.annotations)
        ?? blockId
        ?? null;

      return (
        <span
          key={segment.id}
          onMouseEnter={(e) => {
            e.stopPropagation();
            onHover(selectedId);
          }}
          onMouseLeave={(e) => {
            e.stopPropagation();
            onHover(blockId);
          }}
          onClick={(e) => {
            if (selectedId && selectedId !== blockId) {
              e.stopPropagation();
              onClick(selectedId);
            }
          }}
        >
          <NestedSegment
            annotations={segment.annotations}
            annotation={(annotation, children) => (
              <AnnotationSegment
                annotation={annotation}
                selected={selected}
              >
                {children}
              </AnnotationSegment>
            )}
          >
            {body}
          </NestedSegment>
        </span>
      );
    })}
  </>;
}

/**
 * Which annotation in a segment to select?
 * entity > word
 */
function selectAnnotation(annotations: Annotation[]): Id | undefined {
  const entity = annotations.find(a => isEntity(a));
  if (entity) {
    return entity.id;
  }
  const word = annotations.find(a => isWord(a));
  if (word) {
    return word.id;
  }
}
