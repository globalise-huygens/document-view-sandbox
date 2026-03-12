import {
  Annotation,
  getBody,
  assertTextualBody,
  findSvgPath,
  parseSvgPath
} from '@globalise/common/annotation';
import {Fragment} from '@knaw-huc/original-layout';

export function createFragment(word: Annotation): Fragment {
  const id = word.id;
  const body = getBody(word);
  assertTextualBody(body);
  const text = body.value;
  const path = parseSvgPath(findSvgPath(word));
  return {id, text, path};
}
