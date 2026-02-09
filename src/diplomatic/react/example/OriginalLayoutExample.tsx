import {useAnnotationPage} from "../useAnnotationPage";
import {OriginalLayout} from "../OriginalLayout";

export function OriginalLayoutExample() {
  const path = '../../iiif/annotations/transcriptions/NL-HaNA_1.04.02_3598_0797.json';
  const { annotations, page } = useAnnotationPage(path);

  if (!annotations || !page) {
    return <div>Loading…</div>;
  }
  return <OriginalLayout annotations={annotations} config={{ page }} />;
}

