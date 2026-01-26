import {Annotation, AnnotationPage} from '../diplomatic/AnnoModel';
import {Id} from '../diplomatic/Id';
import {findResourceTarget} from '../diplomatic/findResourceTarget';
import {findTextualBodyValue} from './findTextualBodyValue';
import {$} from '../diplomatic/example/$';
import {joinElements} from './joinElements';
import {D3El} from "../diplomatic/D3El";
import {select} from "d3-selection";
import {orThrow} from "../util/orThrow";
import {pickBy} from "lodash";

export function renderNormalizedLayout(
  $parent: HTMLElement,
  annotations: Record<Id, Annotation>,
) {
  const $view = document.createElement('div')
  $parent.append($view)
  $view.classList.add('normalized-view')
  const wordAnnos = pickBy(annotations, (a) => a.textGranularity === 'word');

  const linesWithWords: Record<Id, Annotation[]> = {};
  for (const wordAnno of Object.values(wordAnnos)) {
    const lineId = findResourceTarget(wordAnno).id;
    if (!linesWithWords[lineId]) {
      linesWithWords[lineId] = [];
    }
    linesWithWords[lineId].push(wordAnno);
  }

  const $text = document.createElement('div');
  $view.appendChild($text);
  $text.classList.add('text');

  const $words: Record<Id, HTMLElement> = {};
  const $lines = Object.fromEntries(
    Object.entries(linesWithWords).map(([id, wordAnnos], i) => {
      const $lineWords = wordAnnos.map((wordAnno) => {
        const word = findTextualBodyValue(wordAnno);
        const $word = document.createElement('span');
        $word.textContent = word;
        $word.classList.add('word');
        $words[wordAnno.id] = $word;
        return $word;
      });
      const $line = document.createElement('span');
      $line.classList.add('line');
      const $lineNumber = document.createElement('span');
      $line.append($lineNumber);
      $lineNumber.classList.add('line-number');
      $lineNumber.textContent = `${i}`.padStart(2, ' ');
      $line.append(...joinElements($lineWords));
      return [id, $line];
    }));

  $text.append(...Object.values($lines));

  const {width, height} = $view.getBoundingClientRect();
  const $overlay: D3El<SVGSVGElement> = select($view)
    .append('svg')
    .attr('class', 'overlay')
    .attr('width', width)
    .attr('height', height);

  return {
    $words,
    $lines,
    $overlay: $overlay.node() ?? orThrow('No svg element')
  };
}