import {useAnnotationPage} from "../useAnnotationPage";
import {DiplomaticView} from "../DiplomaticView";

export function DiplomaticExample() {
  const pagePath = '../../iiif/annotations/transcriptions/NL-HaNA_1.04.02_3598_0797.json';
  const {annotations: pageAnnotations, page} = useAnnotationPage(pagePath);

  const entityPath = '../../iiif/annotations/entities/NL-HaNA_1.04.02_3598_0797.json';
  const {annotations: entityAnnotations} = useAnnotationPage(entityPath);

  if (!pageAnnotations || !entityAnnotations || !page) {
    return <div>Loading…</div>;
  }

  const annotations = {...pageAnnotations, ...entityAnnotations};
  return (
    <DiplomaticView
      annotations={annotations}
      page={page}
      showRegions={true}
      showEntities={true}
      fit="height"
      style={{height: '100vh'}}
    />
  );
}