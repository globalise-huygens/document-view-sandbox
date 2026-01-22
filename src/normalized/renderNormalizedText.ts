import {Annotation, AnnotationPage} from "../diplomatic/AnnoModel";
import {Id} from "../diplomatic/Id";
import {findResourceTarget} from "../diplomatic/findResourceTarget";
import {findTextualBodyValue} from "./findTextualBodyValue";

export function renderNormalizedText(
  $view: HTMLElement,
  page: AnnotationPage
) {
  const wordAnnos = page.items.filter(a => a.textGranularity === 'word')

  const linesWithWords: Record<Id, Annotation[]> = {}
  for (const wordAnno of wordAnnos) {
    const lineId = findResourceTarget(wordAnno).id
    if (!linesWithWords[lineId]) {
      linesWithWords[lineId] = []
    }
    linesWithWords[lineId].push(wordAnno)
  }
  const linesOfWords = Object
    .values(linesWithWords)
    .map((wordAnnos) => wordAnnos.map(findTextualBodyValue).join(' '))
    .join('\n');
  $view.textContent = linesOfWords
}