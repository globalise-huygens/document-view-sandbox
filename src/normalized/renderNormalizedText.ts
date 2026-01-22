import {Annotation, AnnotationPage} from "../diplomatic/AnnoModel";
import {Id} from "../diplomatic/Id";
import {findResourceTarget} from "../diplomatic/findResourceTarget";
import {findTextualBodyValue} from "./findTextualBodyValue";
import {$} from "../diplomatic/example/$";

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
  const $lines = Object
    .values(linesWithWords)
    .map((wordAnnos) => {
      const $words = wordAnnos.map(anno => {
        const word = findTextualBodyValue(anno)
        const $word = document.createElement('span')
        $word.textContent = `${word} `
        $word.classList.add('word')
        return $word;
      });
      const $line = document.createElement('span')
      $line.classList.add('line')
      $line.append(...$words)
      return $line;
    })

  $view.append(...$lines)
}