import { useViewerStore } from "./stores/viewer-store";
import Thumbnails from "./Thumbnails";
import Transcription from "./Transcription";
import { fetchAnnoPage } from "./utils/fetchAnnoPage";
import { fetchManifest } from "./utils/fetchManifest";
import { fetchTranscription } from "./utils/fetchTranscription";
import Viewer from "./Viewer";
import { loadTranscription } from "./utils/loadTranscription";

const MANIFEST =
  "https://globalise-huygens.github.io/document-view-sandbox/iiif/manifest.json";

const manifest = await fetchManifest(MANIFEST);
const annoPage = await fetchAnnoPage(manifest);
const text = await fetchTranscription(annoPage);

function App() {
  const viewer = useViewerStore((s) => s.viewer);
  const viewerReady = useViewerStore((s) => s.viewerReady);
  const firstCanvas = manifest.items[0];
  const defaultInfoJsonUrl =
    firstCanvas.items?.[0].items?.[0].body?.service[0]["@id"] + "/info.json";

  function thumbnailClickHandler(index: number) {
    const selectedCanvas = manifest.items[index];
    const newInfoJsonUrl =
      selectedCanvas.items?.[0].items?.[0].body?.service[0]["@id"] +
      "/info.json";
    viewer?.open(newInfoJsonUrl);
  }

  if (viewerReady) {
    loadTranscription(annoPage);
  }
  return (
    <>
      <div className="main-content">
        <Viewer tileSource={defaultInfoJsonUrl} />
        <Transcription manifest={manifest} text={text} />
      </div>

      <Thumbnails
        manifest={manifest}
        thumbnailClickHandler={thumbnailClickHandler}
      />
    </>
  );
}

export default App;
