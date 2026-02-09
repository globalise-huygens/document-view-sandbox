import React from "react";
import {DiplomaticExample} from "./DiplomaticExample";
import {OriginalLayoutExample} from "./OriginalLayoutExample";
import {$} from "../../example/$";
import {getExampleFromUrl} from "../../../util/getExampleFromUrl";

const examples = ['original-layout', 'diplomatic'] as const;

export function Example() {
  const example = getExampleFromUrl(examples);
  $(`a.${example}`)?.classList.add('active');
  if (example === 'diplomatic') {
    return <DiplomaticExample/>;
  } else {
    return <OriginalLayoutExample/>;
  }
}