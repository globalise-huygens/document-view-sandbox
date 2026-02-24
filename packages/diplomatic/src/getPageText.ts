import {Id, orThrow} from '@knaw-huc/original-layout';
import {Annotation, getBody, assertTextualBody} from '@globalise/annotation';

export function getPageText(annotations: Record<Id, Annotation>) {
  const htrPageAnno = Object.values(annotations).find(
    (a) => a.textGranularity === 'page' && getBody(a),
  ) ?? orThrow('No htr transcription');
  const htrBody = getBody(htrPageAnno) ?? orThrow('No body');
  assertTextualBody(htrBody);
  const text = htrBody.value;
  return {id: htrPageAnno.id, text};
}
