import {Annotation} from "@globalise/diplomatic-view";
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
