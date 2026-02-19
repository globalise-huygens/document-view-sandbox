import {useEffect} from 'react';
import {
  useCanvas,
  useLoadManifest,
  useManifest
} from "@knaw-huc/osd-iiif-viewer";


type ManifestLoaderProps = {
  children: React.ReactNode,
  url: string,
  canvas: number
};

export function ManifestLoader(
  {children, url, canvas}: ManifestLoaderProps
) {
  const loadManifest = useLoadManifest();
  const {goTo} = useCanvas();
  const manifest = useManifest();

  useEffect(() => {
    loadManifest(url);
  }, [loadManifest, url]);

  useEffect(() => {
    if (manifest.data) {
      goTo(canvas);
    }
  }, [manifest.data, goTo, canvas]);

  if (manifest.isLoading) {
    return <>Loading manifest</>;
  }
  if (manifest.error) {
    return <>Error: {manifest.error}</>;
  }
  if (!manifest.data) {
    return null;
  }

  return <>{children}</>;
}