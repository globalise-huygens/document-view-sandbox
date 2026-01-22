import {$} from "../diplomatic/example/$";
import {AnnotationPage} from "../diplomatic/AnnoModel";
import {reloadOnEsBuild} from "../util/reloadOnEsBuild";
import {Benchmark} from "../diplomatic/Benchmark";
import {renderLineByLineView} from "./renderLineByLineView";

reloadOnEsBuild()

main()

async function main() {
  const pagePath = '../iiif/annotations/transcriptions/NL-HaNA_1.04.02_3598_0797.json';
  const pageResponse = await fetch(pagePath);
  const page: AnnotationPage = await pageResponse.json();
  const entityPath =
    '../iiif/annotations/entities/NL-HaNA_1.04.02_3598_0797.json';
  const entityResponse = await fetch(entityPath);
  const entities: AnnotationPage = await entityResponse.json();
  const $view = $('#viewer')
  const annotations = [...page.items, ...entities.items];
  new Benchmark(renderLineByLineView.name).run(() => {
    renderLineByLineView({$view, annotations});
  });
}