import OpenSeadragon from "openseadragon";
import React from "react";
import { useViewerStore } from "./stores/viewer-store";

type ViewerProps = {
  tileSource: string | OpenSeadragon.TileSourceOptions;
};

function Viewer(props: ViewerProps) {
  const viewerRef = React.useRef<OpenSeadragon.Viewer | null>(null);
  const osdContainerRef = React.useRef<HTMLDivElement | null>(null);
  const setViewer = useViewerStore((s) => s.setViewer);
  const setViewerReady = useViewerStore((s) => s.setViewerReady);

  React.useEffect(() => {
    if (osdContainerRef.current) {
      viewerRef.current = new OpenSeadragon.Viewer({
        element: osdContainerRef.current,
        prefixUrl: "https://openseadragon.github.io/openseadragon/images/",
        crossOriginPolicy: "Anonymous",
        tileSources: props.tileSource,
      });
      setViewer(viewerRef.current);
      const onOpen = () => setViewerReady(true);
      viewerRef.current?.addOnceHandler("open", onOpen);
    }

    return () => {
      if (viewerRef.current) {
        viewerRef.current.destroy();
        viewerRef.current = null;
        setViewer(null);
      }
    };
  }, []);

  return <div id="viewer" ref={osdContainerRef}></div>;
}

export default Viewer;
