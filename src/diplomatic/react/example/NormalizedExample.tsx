import {useAnnotationPage} from "../useAnnotationPage";
import {NormalizedLayout} from "../NormalizedLayout";

export function NormalizedExample() {
  const pagePath = '../../iiif/annotations/transcriptions/NL-HaNA_1.04.02_3598_0797.json';
  const {annotations: pageAnnotations, page} = useAnnotationPage(pagePath);

  const entityPath = '../../iiif/annotations/entities/NL-HaNA_1.04.02_3598_0797.json';
  const {annotations: entityAnnotations} = useAnnotationPage(entityPath);

  if (!pageAnnotations || !entityAnnotations || !page) {
    return <div>Loading…</div>;
  }

  const annotations = {...pageAnnotations, ...entityAnnotations};
  return (
    <NormalizedLayout
      annotations={annotations}
      style={{height: '100vh'}}
    />
  );
}