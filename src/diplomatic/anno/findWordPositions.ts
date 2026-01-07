import type {AnnotationPage} from '../AnnoModel';
import {assertTextualBody} from './assertTextualBody';
import {assertSpecificResourceTarget} from './assertSpecificResourceTarget';
import {assertSvgSelector} from './assertSvgSelector';
import {parseSvgPath} from './parseSvgPath';
import {isEmpty} from 'lodash';
import {isWord} from "./isWord";

export type TextPath = { text: string; path: string };

export function findWordPositions(
  annoPage: AnnotationPage,
): TextPath[] {
  const words: TextPath[] = [];
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
    if (!annotation.target || isEmpty(annotation.target)) {
      throw new Error('Annotation missing target');
    }
    const target = Array.isArray(annotation.target)
      ? annotation.target[0]
      : annotation.target;
    assertSpecificResourceTarget(target);
    const selector = target.selector;
    assertSvgSelector(selector);
    const path = parseSvgPath(selector.value);
    words.push({ text, path });
  }
  return words;
}
