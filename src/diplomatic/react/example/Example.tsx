import React from "react";
import {$} from "../../example/$";
import {getExampleFromUrl} from "../../../util/getExampleFromUrl";
import {DualViewExample} from "./DualViewExample";

const examples = ['original-layout', 'dual-view'] as const;

export function Example() {
  const example = getExampleFromUrl(examples);
  $(`a.${example}`)?.classList.add('active');
  if (example === 'dual-view') {
    return <DualViewExample/>;
  } else {
    return "Unknown example"
  }
}