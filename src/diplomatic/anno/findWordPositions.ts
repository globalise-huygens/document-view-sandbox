import type {AnnotationPage} from '../AnnoModel';
import {assertTextualBody} from './assertTextualBody';
import {isEmpty} from 'lodash';
import {isWord} from "./isWord";
import {findSvgPath} from "./findSvgPath";

export type WordPath = { text: string; path: string };

export function findWordPositions(
  annoPage: AnnotationPage,
): WordPath[] {
  const words: WordPath[] = [];
  if (!annoPage.items) {
    return words;
  }
  for (const annotation of annoPage.items) {
    if (!isWord(annotation)) {
      continue;
    }
    if (!annotation.body || isEmpty(annotation.body)) {
      throw new Error('Annotation missing body');
    }
    const body = Array.isArray(annotation.body)
      ? annotation.body[0]
      : annotation.body;
    assertTextualBody(body);
    const text = body.value;
    const path = findSvgPath(annotation);
    words.push({ text, path });
  }
  return words;
}
