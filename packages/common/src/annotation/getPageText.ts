import {Id} from './Id';
import {orThrow} from './orThrow';
import {Annotation} from './AnnoModel';
import {getBody} from './getBody';
import {assertTextualBody} from './assertTextualBody';

export function getPageText(annotations: Record<Id, Annotation>) {
  const htrPageAnno = Object.values(annotations).find(
    (a) => a.textGranularity === 'page' && getBody(a),
  ) ?? orThrow('No htr transcription');
  const htrBody = getBody(htrPageAnno) ?? orThrow('No body');
  assertTextualBody(htrBody);
  const text = htrBody.value;
  return {id: htrPageAnno.id, text};
}