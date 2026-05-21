import {
  Annotation,
  getBody,
  assertTextualBody,
  findSvgPath,
  parseSvgPath
} from '@globalise/common/annotation';
import {Fragment} from '@knaw-huc/original-layout';
import { orThrow } from '@globalise/common';

export function createFragment(word: Annotation): Fragment {
  const id = word.id;
  const body = getBody(word);
  assertTextualBody(body);
  const text = body.value;
  const svgPath = findSvgPath(word) || orThrow('No Path');
  const path = parseSvgPath(svgPath);
  return {id, text, path};
}
