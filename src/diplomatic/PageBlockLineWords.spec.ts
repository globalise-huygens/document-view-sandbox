import { assert, describe, expect, it } from 'vitest';
import * as fs from 'node:fs';
import { Annotation, AnnotationPage } from './AnnoModel';
import { isWord } from './anno/isWord';
import { isAnnotationResourceTarget } from './anno/isAnnotationResourceTarget';
import { isLine } from './anno/isLine';
import { isBlock } from './anno/isBlock';
import { isPage } from './anno/isPage';
import { findResourceTarget } from './findResourceTarget';
import { orThrow } from '../util/orThrow';
import { findTextualBodyValue } from '../normalized/findTextualBodyValue';
import { Id } from './Id';

describe('AnnotationPage', () => {
  it('links every word to a line', () => {
    const pagePath =
      'static/iiif/annotations/transcriptions/NL-HaNA_1.04.02_3598_0797.json';
    const page: AnnotationPage = JSON.parse(fs.readFileSync(pagePath, 'utf-8'));
    assert(page.items);
    const words = page.items.filter(isWord);
    expect(words.length).toBe(200);
    const annoResourceTargets = words
      .map((w) => {
        assert(w.target);
        assert(Array.isArray(w.target));
        return w.target.find(isAnnotationResourceTarget);
      })
      .filter((target) => !!target);
    expect(annoResourceTargets.length).toBe(200);
    const targetedAnnotations: Annotation[] = annoResourceTargets
      .map((target) => {
        assert(target);
        assert(isAnnotationResourceTarget(target));
        return page.items.find((a) => a.id === target.id);
      })
      .filter((a) => !!a);
    expect(targetedAnnotations.length).toBe(200);
    const lines = targetedAnnotations.filter(isLine);
    expect(lines.length).toBe(200);
  });

  it('links every line to a block', () => {
    const pagePath =
      'static/iiif/annotations/transcriptions/NL-HaNA_1.04.02_3598_0797.json';
    const page: AnnotationPage = JSON.parse(fs.readFileSync(pagePath, 'utf-8'));
    assert(page.items);
    const lines = page.items.filter(isLine);
    expect(lines.length).toBe(30);
    const annoResourceTargets = lines
      .map(findResourceTarget)
      .filter((target) => !!target);

    expect(annoResourceTargets.length).toBe(30);
    const foundAnnotations: Annotation[] = annoResourceTargets
      .map((target) => {
        assert(target);
        assert(isAnnotationResourceTarget(target));
        return page.items.find((a) => a.id === target.id);
      })
      .filter((a) => !!a);
    expect(foundAnnotations.length).toBe(30);
    const blocks = foundAnnotations.filter(isBlock);
    expect(blocks.length).toBe(30);
  });

  it('links every block to a page', () => {
    const pagePath =
      'static/iiif/annotations/transcriptions/NL-HaNA_1.04.02_3598_0797.json';
    const page: AnnotationPage = JSON.parse(fs.readFileSync(pagePath, 'utf-8'));
    assert(page.items);
    const blocks = page.items.filter(isBlock);
    expect(blocks.length).toBe(13);
    const annoResourceTargets = blocks
      .map((w) => {
        assert(w.target);
        assert(Array.isArray(w.target));
        return w.target.find(isAnnotationResourceTarget);
      })
      .filter((target) => !!target);
    expect(annoResourceTargets.length).toBe(13);
    const foundAnnotations: Annotation[] = annoResourceTargets
      .map((target) => {
        assert(target);
        assert(isAnnotationResourceTarget(target));
        return page.items.find((a) => a.id === target.id);
      })
      .filter((a) => !!a);
    expect(foundAnnotations.length).toBe(13);
    const pageAnno = foundAnnotations.filter(isPage);
    expect(pageAnno.length).toBe(13);
  });

  it('has a transcription-diplomatic text that equals lines x words', () => {
    const pagePath =
      'static/iiif/annotations/transcriptions/NL-HaNA_1.04.02_3598_0797.json';

    const page: AnnotationPage = JSON.parse(fs.readFileSync(pagePath, 'utf-8'));
    assert(page.items);
    const pageAnnos = page.items.filter((a) => a.textGranularity === 'page');

    const htrAnnotation =
      pageAnnos.find((a) => a.purpose === 'transcription-diplomatic') ??
      orThrow('No htr');
    const htr = findTextualBodyValue(htrAnnotation);

    const wordAnnos = page.items.filter((a) => a.textGranularity === 'word');
    const linesWithWords: Record<Id, Annotation[]> = {};
    for (const wordAnno of wordAnnos) {
      const lineId = findResourceTarget(wordAnno).id;
      if (!linesWithWords[lineId]) {
        linesWithWords[lineId] = [];
      }
      linesWithWords[lineId].push(wordAnno);
    }
    const linesOfWords = Object.values(linesWithWords)
      .map((wordAnnos) => wordAnnos.map(findTextualBodyValue).join(' '))
      .join('\n');

    expect(linesOfWords).toBe(htr);
  });
});
