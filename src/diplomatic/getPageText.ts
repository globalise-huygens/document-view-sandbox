import {Id} from "./anno/Id";
import {Annotation} from "./anno/AnnoModel";
import {getBody} from "../highlight/example/getBody";
import {orThrow} from "../util/orThrow";
import {assertTextualBody} from "./anno/assertTextualBody";

export function getPageText(annotations: Record<Id, Annotation>) {
  const htrPageAnno = Object.values(annotations).find(
    (a) => a.textGranularity === 'page' && getBody(a),
  ) ?? orThrow('No htr transcription');
  const htrBody = getBody(htrPageAnno) ?? orThrow('No body');
  assertTextualBody(htrBody);
  const text = htrBody.value;
  return {id: htrPageAnno.id, text};
}