import {AnnotationPage} from '../AnnoModel';
import {$} from './$';
import {mapAnnotationsById} from './mapAnnotationsById';
import {createRanges} from "../../highlight/createRanges";
import {findTextPositionSelector} from "../findTextPositionSelector";
import {orThrow} from "../../util/orThrow";
import {assertTextualBody} from "../anno/assertTextualBody";
import {getBody} from "../../highlight/example/getBody";
import {renderOriginalLayout} from "../renderOriginalLayout";
import {createFragment} from "../createFragment";
import {Benchmark} from "../Benchmark";
import {Id} from "../Id";
import {groupRanges} from "./groupRanges";
import {getEntityType} from "../getEntityType";
import {toClassName} from "../toClassName";
import {isEntity} from "../EntityModel";

export async function renderOffsetExample($parent: HTMLElement) {
  const transcriptionPath =
    '../iiif/annotations/transcriptions/NL-HaNA_1.04.02_3598_0797.json';
  const entityPath =
    '../iiif/annotations/entities/NL-HaNA_1.04.02_3598_0797.json';

  $parent.classList.add('offsets');
  const $menu = $('#menu');
  const $controls = document.createElement('span');
  $menu.append($controls);
  $controls.classList.add('controls');

  const transcriptionResponse = await fetch(transcriptionPath);
  const transcription: AnnotationPage = await transcriptionResponse.json();
  const transcriptionAnnotations = mapAnnotationsById(transcription.items);
  const entityResponse = await fetch(entityPath);
  const entityPage: AnnotationPage = await entityResponse.json();
  const entityAnnotations = mapAnnotationsById(entityPage.items);
  const annotations = Object.assign({}, transcriptionAnnotations, entityAnnotations);
  const words = transcription.items.filter(a => a.textGranularity === 'word')
  const fragments = words.map(createFragment)
  const htrPageAnno = transcription.items.find((a) =>
    a.textGranularity === 'page' && getBody(a)
  ) ?? orThrow('No htr transcription');
  const htrBody = getBody(htrPageAnno) ?? orThrow('No body')
  assertTextualBody(htrBody);
  const pageText = htrBody.value;

  const markedAnnos = [...words, ...entityPage.items]
  const annoRanges = markedAnnos.map((annotation) => {
    const selector = findTextPositionSelector(annotation, htrPageAnno.id);
    return {
      begin: selector.start,
      end: selector.end,
      body: annotation,
    };
  });

  const textRanges = [...Object.values(createRanges(pageText, annoRanges))];

  const $view = document.createElement('div')
  $parent.append($view)
  $view.classList.add('original-layout')

  new Benchmark(renderOriginalLayout.name).run(() => {
    const layout = renderOriginalLayout($view, fragments, {page: transcription.partOf})

    const groupedByWord = groupRanges(
      textRanges,
      (id: Id) => id.includes('#word_')
    );
    for (const group of groupedByWord) {
      const $word = layout.$fragments[group.group];
      const $ranges = []
      for (const range of group.ranges) {
        const $range = document.createElement('span')
        $ranges.push($range)
        $range.classList.add('range')
        $range.textContent = pageText.substring(range.begin, range.end)
        for (const annoId of range.annotations) {
          const annotation = annotations[annoId]
          if (isEntity(annotation)) {
            const entityType = getEntityType(annotation);
            $range.classList.add(...['entity', toClassName(entityType)]);
            $range.title = `${entityType} | ${annotation.id}`;
          }
        }
      }
      $word.replaceChildren(...$ranges)
    }
  })
}
