import React from "react";
import {DiplomaticExample} from "./DiplomaticExample";
import {OriginalLayoutExample} from "./OriginalLayoutExample";
import {$} from "../../example/$";
import {getExampleFromUrl} from "../../../util/getExampleFromUrl";
import {NormalizedExample} from "./NormalizedExample";

const examples = ['original-layout', 'diplomatic', 'normalized'] as const;

export function Example() {
  const example = getExampleFromUrl(examples);
  $(`a.${example}`)?.classList.add('active');
  if (example === 'diplomatic') {
    return <DiplomaticExample/>;
  } else if (example === 'normalized') {
    return <NormalizedExample/>;
  } else if (example === 'original-layout') {
    return <OriginalLayoutExample/>;
  } else {
    return "Unknown example"
  }
}