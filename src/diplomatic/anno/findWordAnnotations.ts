// src/diplomatic/anno/findWordAnnotations.ts
import type {IiifAnnotationPage} from '../AnnoModel';
import {assertTextualBody} from './assertTextualBody';
import {assertSpecificResourceTarget} from './assertSpecificResourceTarget';
import {assertSvgSelector} from './assertSvgSelector';
import {parseSvgPath} from './parseSvgPath';
import {isEmpty} from "lodash";

export type WordAnnotation = { text: string; points: string };

export function findWordAnnotations(
  annoPage: IiifAnnotationPage,
): WordAnnotation[] {
  const words: WordAnnotation[] = [];
  if (!annoPage.items) {
    return words;
  }
  for (const annotation of annoPage.items) {
    if (annotation.textGranularity !== 'word') {
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
    const points = parseSvgPath(selector.value);
    words.push({text, points});
  }
  return words;
}
