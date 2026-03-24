import {ReactNode} from "react";
import {Annotation} from "@globalise/common/annotation";

/**
 * Nest the annotations of a segment, so that each next annotation component wraps the previous, the last wrapping all.
 *
 * Example:
 * segment.annotations = [searchMatchAnno, wordAnno, entityAnno] with body "lorem".
 * `annotations.reduce` starts from entityAnno, wrapping inward:
 * ```jsx:
 * <Entity>
 *   <Word>
 *     <SearchMatch>
 *       lorem
 *     </SearchMatch>
 *   </Word>
 * </Entity>
 * ```
 */
export function NestedSegment(
  {
    annotations,
    annotation: annotationComponent,
    children,
  }: {

    /**
     * All annotations of a segment
     */
    annotations: Annotation[];

    /**
     * Render an annotation segment, with all previous annotations as its children
     */
    annotation: (annotation: Annotation, children: ReactNode) => ReactNode;
    children: ReactNode;
  }
) {
  return annotations.reduce<ReactNode>(
    (nested, annotation) => annotationComponent(annotation, nested),
    children,
  );
}