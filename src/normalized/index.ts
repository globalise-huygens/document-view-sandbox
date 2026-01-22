import {$} from "../diplomatic/example/$";
import {Annotation, AnnotationPage} from "../diplomatic/AnnoModel";
import {orThrow} from "../util/orThrow";
import {findTextualBodyValue} from "./findTextualBodyValue";
import {reloadOnEsBuild} from "../util/reloadOnEsBuild";
import {Id} from "../diplomatic/Id";
import {findResourceTarget} from "../diplomatic/findResourceTarget";

reloadOnEsBuild()

main()

async function main() {
  const path = '../iiif/annotations/transcriptions/NL-HaNA_1.04.02_3598_0797.json';

  const annoResponse = await fetch(path);
  const page: AnnotationPage = await annoResponse.json();
  const pageAnnos = page.items.filter(a => a.textGranularity === 'page');

  const htrAnnotation = pageAnnos
    .find(a => a.purpose === 'transcription-diplomatic') ?? orThrow('No htr')
  const htr = findTextualBodyValue(htrAnnotation);
  const $htr = $('#htr')
  $htr.textContent = `text from transcription-diplomatic annotation:\n\n${htr}`

  const normalizedAnnotation = pageAnnos
    .find(a => a.purpose === 'transcription-normalized') ?? orThrow('No normalized')
  const normalized = findTextualBodyValue(normalizedAnnotation);
  const $normalized = $('#normalized')
  $normalized.textContent = `text from transcription-normalized annotation:\n\n${normalized}`

  const wordAnnos = page.items.filter(a => a.textGranularity === 'word')

  const linesWithWords: Record<Id, Annotation[]> = {}
  for (const wordAnno of wordAnnos) {
    const lineId = findResourceTarget(wordAnno).id
    if (!linesWithWords[lineId]) {
      linesWithWords[lineId] = []
    }
    linesWithWords[lineId].push(wordAnno)
  }
  const $words = $('#words')
  const linesOfWords = Object
    .values(linesWithWords)
    .map((wordAnnos) => wordAnnos.map(findTextualBodyValue).join(' '))
    .join('\n');
  $words.textContent = `text from word and line annotations:\n\n${linesOfWords}`
}