import { IiifAnnotationPage } from "../AnnoModel";
import { assertTextualBody } from "./assertTextualBody";
import { assertSpecificResourceTarget } from "./assertSpecificResourceTarget";
import { assertSvgSelector } from "./assertSvgSelector";
import { parseSvgPath } from "./parseSvgPath";

export function findAnnoWords(
  annoPage: IiifAnnotationPage,
): { text: string; points: string }[] {
  const words = [];
  for (const annotation of annoPage.items) {
    if (annotation.textGranularity !== "word") {
      continue;
    }
    if (!annotation.body || annotation.body.length === 0) {
      throw new Error("Annotation missing body");
    }
    const body = annotation.body[0];
    assertTextualBody(body);
    const text = body.value;
    if (!annotation.target || annotation.target.length === 0) {
      throw new Error("Annotation missing target");
    }
    const target = annotation.target[0];
    assertSpecificResourceTarget(target);
    const selector = target.selector;
    assertSvgSelector(selector);
    const points = parseSvgPath(selector.value);
    words.push({ text, points });
  }
  return words;
}
