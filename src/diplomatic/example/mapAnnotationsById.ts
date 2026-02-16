import {Annotation} from "@knaw-huc/original-layout/diplomatic";
import {Id} from "@knaw-huc/original-layout";

export function mapAnnotationsById(annotations: Annotation[]) {
  return annotations.reduce(
    (prev, curr) => {
      prev[curr.id] = curr;
      return prev;
    },
    {} as Record<Id, Annotation>,
  );
}
