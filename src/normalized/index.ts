import {$} from "../diplomatic/example/$";
import {AnnotationPage} from "../diplomatic/AnnoModel";
import {orThrow} from "../util/orThrow";
import {findTextualBodyValue} from "./findTextualBodyValue";
import {reloadOnEsBuild} from "../util/reloadOnEsBuild";
import {renderNormalizedText} from "./renderNormalizedText";
import {Benchmark} from "../diplomatic/Benchmark";

reloadOnEsBuild()

main()

async function main() {
  const path = '../iiif/annotations/transcriptions/NL-HaNA_1.04.02_3598_0797.json';
  const annoResponse = await fetch(path);
  const page: AnnotationPage = await annoResponse.json();
  const $viewer = $('#viewer')
  new Benchmark(renderNormalizedText.name)
    .run(() => renderNormalizedText($viewer, page));
}