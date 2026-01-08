import {assert, describe, expect, it} from "vitest";
import * as fs from "node:fs";
import {Annotation, AnnotationPage} from "./AnnoModel";
import {isWord} from "./anno/isWord";
import {isAnnotationResourceTarget} from "./anno/isAnnotationResourceTarget";
import {isLine} from "./anno/isLine";
import {isBlock} from "./anno/isBlock";
import {isPage} from "./anno/isPage";
import {findAnnotationResourceTarget} from "./findAnnotationResourceTarget";

describe('AnnotationPage', () => {

  it('links every word to a line', () => {
    const pagePath = 'static/iiif/annotations/transcriptions/NL-HaNA_1.04.02_3598_0797.json';
    const page: AnnotationPage = JSON.parse(fs.readFileSync(pagePath, 'utf-8'));
    assert(page.items)
    const words = page.items.filter(isWord)
    expect(words.length).toBe(200)
    const annoResourceTargets = words.map(w => {
      assert(w.target)
      assert(Array.isArray(w.target))
      return w.target.find(isAnnotationResourceTarget);
    }).filter(target => !!target)
    expect(annoResourceTargets.length).toBe(200)
    const targetedAnnotations: Annotation[] = annoResourceTargets.map(target => {
      assert(target)
      assert(isAnnotationResourceTarget(target))
      return page.items.find(a => a.id === target.id)
    }).filter(a => !!a)
    expect(targetedAnnotations.length).toBe(200)
    const lines = targetedAnnotations.filter(isLine)
    expect(lines.length).toBe(200)
  })

  it('links every line to a block', () => {
    const pagePath = 'static/iiif/annotations/transcriptions/NL-HaNA_1.04.02_3598_0797.json';
    const page: AnnotationPage = JSON.parse(fs.readFileSync(pagePath, 'utf-8'));
    assert(page.items)
    const lines = page.items.filter(isLine)
    expect(lines.length).toBe(30)
    const annoResourceTargets = lines
      .map(findAnnotationResourceTarget)
      .filter(target => !!target)


    expect(annoResourceTargets.length).toBe(30)
    const foundAnnotations: Annotation[] = annoResourceTargets.map(target => {
      assert(target)
      assert(isAnnotationResourceTarget(target))
      return page.items.find(a => a.id === target.id)
    }).filter(a => !!a)
    expect(foundAnnotations.length).toBe(30)
    const blocks = foundAnnotations.filter(isBlock)
    expect(blocks.length).toBe(30)
  })

  it('links every block to a page', () => {
    const pagePath = 'static/iiif/annotations/transcriptions/NL-HaNA_1.04.02_3598_0797.json';
    const page: AnnotationPage = JSON.parse(fs.readFileSync(pagePath, 'utf-8'));
    assert(page.items)
    const blocks = page.items.filter(isBlock)
    expect(blocks.length).toBe(13)
    const annoResourceTargets = blocks.map(w => {
      assert(w.target)
      assert(Array.isArray(w.target))
      return w.target.find(isAnnotationResourceTarget);
    }).filter(target => !!target)
    expect(annoResourceTargets.length).toBe(13)
    const foundAnnotations: Annotation[] = annoResourceTargets.map(target => {
      assert(target)
      assert(isAnnotationResourceTarget(target))
      return page.items.find(a => a.id === target.id)
    }).filter(a => !!a)
    expect(foundAnnotations.length).toBe(13)
    const pageAnno = foundAnnotations.filter(isPage)
    expect(pageAnno.length).toBe(13)
  })
})
