import {AnnotationPage} from "../../diplomatic/AnnoModel";
import {mapAnnotationsById} from "../../diplomatic/example/mapAnnotationsById";
import {Benchmark} from "../../diplomatic/Benchmark";
import {renderLineByLineView} from "../renderLineByLineView";

export async function renderMinimalExample($parent: HTMLElement) {
  const pagePath =
    '../iiif/annotations/transcriptions/NL-HaNA_1.04.02_3598_0797.json';
  const pageResponse = await fetch(pagePath);
  const page: AnnotationPage = await pageResponse.json();
  const entityPath =
    '../iiif/annotations/entities/NL-HaNA_1.04.02_3598_0797.json';
  const entityResponse = await fetch(entityPath);
  const entities: AnnotationPage = await entityResponse.json();
  const annotations = mapAnnotationsById([...page.items, ...entities.items]);
  new Benchmark(renderLineByLineView.name).run(() => {
    renderLineByLineView({ $view: $parent, annotations });
  });
}