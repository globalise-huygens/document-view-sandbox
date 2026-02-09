import React from "react";
import {DiplomaticExample} from "./DiplomaticExample";
import {OriginalLayoutExample} from "./OriginalLayoutExample";
import {$} from "../../example/$";
import {getExampleFromUrl} from "../../../util/getExampleFromUrl";
import {NormalizedExample} from "./NormalizedExample";
import {LineByLineExample} from "./LineByLineExample";
import {NormalizedLayout} from "../NormalizedLayout";

const examples = ['original-layout', 'diplomatic', 'normalized', 'line-by-line'] as const;

export function Example() {
  const example = getExampleFromUrl(examples);
  $(`a.${example}`)?.classList.add('active');
  if (example === 'original-layout') {
    return <OriginalLayoutExample/>;
  } else if (example === 'diplomatic') {
    return <DiplomaticExample/>;
  } else if (example === 'normalized') {
    return <NormalizedExample/>;
  } else if (example === 'line-by-line') {
    return <LineByLineExample/>;
  } else {
    return "Unknown example"
  }
}