import {useAnnotationPage} from "../useAnnotationPage";
import {LineByLineLayout} from "../LineByLineLayout";

export function LineByLineExample() {
  const pagePath = '../../iiif/annotations/transcriptions/NL-HaNA_1.04.02_3598_0797.json';
  const {annotations: pageAnnotations, page} = useAnnotationPage(pagePath);

  const entityPath = '../../iiif/annotations/entities/NL-HaNA_1.04.02_3598_0797.json';
  const {annotations: entityAnnotations} = useAnnotationPage(entityPath);

  if (!pageAnnotations || !entityAnnotations || !page) {
    return <div>Loading…</div>;
  }

  const annotations = {...pageAnnotations, ...entityAnnotations};
  return (
    <LineByLineLayout
      annotations={annotations}
      config={{page, fit: "height"}}
      style={{height: '100vh'}}
    />
  );
}