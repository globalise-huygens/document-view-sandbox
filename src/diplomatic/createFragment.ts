import {Annotation} from "./AnnoModel";
import {getBody} from "../highlight/example/getBody";
import {assertTextualBody} from "./anno/assertTextualBody";
import {findSvgPath} from "./anno/findSvgPath";

import {Fragment} from "./Fragment";

export function createFragment(word: Annotation): Fragment {
  const id = word.id;
  const body = getBody(word)
  assertTextualBody(body);
  const text = body.value;
  const path = findSvgPath(word)
  return {id, text, path}
}