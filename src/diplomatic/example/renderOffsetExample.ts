import {AnnotationPage} from '../AnnoModel';
import {$} from './$';
import {mapAnnotationsById} from './mapAnnotationsById';
import {createRanges} from "../../highlight/createRanges";
import {findTextPositionSelector} from "../findTextPositionSelector";
import {orThrow} from "../../util/orThrow";
import {assertTextualBody} from "../anno/assertTextualBody";
import {getBody} from "../../highlight/example/getBody";

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

  const htrPageAnno = transcription.items.find((a) =>
    a.textGranularity === 'page' && getBody(a)
  ) ?? orThrow('No htr transcription');
  const htrBody = getBody(htrPageAnno) ?? orThrow('No body')
  assertTextualBody(htrBody);
  const pageText = htrBody.value;

  const wordRanges = Object.values(words).map((annotation) => {
    const selector = findTextPositionSelector(annotation, htrPageAnno.id);
    return {
      begin: selector.start,
      end: selector.end,
      body: annotation,
    };
  });

  const textRanges = createRanges(pageText, wordRanges);

  console.log('offset-example', {
    transcription,
    annotations,
    words,
    entities: entityPage.items,
    htrPageAnno,
    textRanges
  });

}
