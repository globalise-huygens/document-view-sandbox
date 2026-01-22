import {Annotation, AnnotationPage} from "../diplomatic/AnnoModel";
import {Id} from "../diplomatic/Id";
import {findResourceTarget} from "../diplomatic/findResourceTarget";
import {findTextualBodyValue} from "./findTextualBodyValue";
import {$} from "../diplomatic/example/$";

export function renderNormalizedLayout(
  $view: HTMLElement,
  annotations: Annotation[]
) {
  const wordAnnos = annotations.filter(a => a.textGranularity === 'word')

  const linesWithWords: Record<Id, Annotation[]> = {}
  for (const wordAnno of wordAnnos) {
    const lineId = findResourceTarget(wordAnno).id
    if (!linesWithWords[lineId]) {
      linesWithWords[lineId] = []
    }
    linesWithWords[lineId].push(wordAnno)
  }
  const $words: Record<Id, HTMLElement> = {}
  const $lines = Object
    .values(linesWithWords)
    .map((wordAnnos) => {
      const $lineWords = wordAnnos.map(wordAnno => {
        const word = findTextualBodyValue(wordAnno)
        const $word = document.createElement('span')
        $word.textContent = `${word} `
        $word.classList.add('word')
        $words[wordAnno.id] = $word
        return $word;
      });
      const $line = document.createElement('span')
      $line.classList.add('line')
      $line.append(...$lineWords)
      return $line;
    })

  $view.append(...$lines)

  return {$words}
}