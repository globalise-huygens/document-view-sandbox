import {TextSegment} from '@knaw-huc/text-annotation-segmenter';
import {Annotation, Id, isEntity, isWord} from '@globalise/common/annotation';
import {setHovered, toggleClicked} from '@globalise/common/DocumentStore';
import {AnnotationSegment} from './AnnotationSegment';
import {NestedSegment} from './NestedSegment';

type TextProps = {
  blockId: Id | null;
  pageText: string;
  segments: TextSegment<Annotation>[];
  selected: Id[];
};

export function SegmentedText(
  {blockId, pageText, segments, selected}: TextProps
) {
  return <>
    {segments.map(segment => {
      const body = pageText.slice(segment.begin, segment.end);
      const hoverId = selectAnnotation(segment.annotations)
        ?? blockId
        ?? null;

      return (
        <span
          key={segment.id}
          onMouseEnter={(e) => {
            e.stopPropagation();
            setHovered(hoverId);
          }}
          onMouseLeave={(e) => {
            e.stopPropagation();
            setHovered(blockId);
          }}
          onClick={(e) => {
            if (hoverId && hoverId !== blockId) {
              e.stopPropagation();
              toggleClicked(hoverId);
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
 * Which annotation to select?
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
