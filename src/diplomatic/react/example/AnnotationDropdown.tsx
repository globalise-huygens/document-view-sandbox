import {Annotation} from "@globalise/annotation";
import {Id} from "@knaw-huc/original-layout";
import React, {useRef} from "react";

export function AnnotationDropdown({placeholder, options, toLabel, onSelect}: {
  placeholder: string;
  options: Annotation[];
  toLabel: (a: Annotation) => string;
  onSelect: (id: Id) => void;
}) {
  const selectRef = useRef<HTMLSelectElement>(null);

  return (
    <select
      ref={selectRef}
      defaultValue=""
      onChange={(e) => {
        onSelect(e.target.value);
        if (selectRef.current) {
          selectRef.current.selectedIndex = 0;
        }
      }}
    >
      <option value="" disabled>{placeholder}</option>
      {options.map(a => (
        <option key={a.id} value={a.id}>{toLabel(a)}</option>
      ))}
    </select>
  );
}