import {Annotation} from './anno/AnnoModel';
import {getBody} from './anno/getBody';
import {assertTextualBody} from './anno/assertTextualBody';
import {findSvgPath} from './anno/findSvgPath';
import {Fragment} from "@knaw-huc/original-layout";
import {parseSvgPath} from "./anno/parseSvgPath.ts";

export function createFragment(word: Annotation): Fragment {
  const id = word.id;
  const body = getBody(word);
  assertTextualBody(body);
  const text = body.value;
  const path = parseSvgPath(findSvgPath(word));
  return {id, text, path};
}
