import {
  Annotation,
  findSourceLabel,
  findTextualBodyValue
} from "@globalise/annotation";
import {Id} from "@knaw-huc/original-layout";
import React from "react";
import {AnnotationDropdown} from "./AnnotationDropdown";

export function Controls({words, regions, onToggleView, onToggleAnnotation}: {
  words: Annotation[];
  regions: Annotation[];
  onToggleView: () => void;
  onToggleAnnotation: (id: Id) => void;
}) {
  return (
    <span className="controls">
      <button onClick={onToggleView}>Toggle view</button>
      <AnnotationDropdown
        placeholder="Toggle words"
        options={words}
        toLabel={findTextualBodyValue}
        onSelect={onToggleAnnotation}
      />
      <AnnotationDropdown
        placeholder="Toggle regions"
        options={regions}
        toLabel={findSourceLabel}
        onSelect={onToggleAnnotation}
      />
    </span>
  );
}


