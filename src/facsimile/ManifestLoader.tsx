import {useEffect} from 'react';
import {
  useCanvas,
  useLoadManifest,
  useManifest
} from "@knaw-huc/osd-iiif-viewer";


type ManifestLoaderProps = {
  children: React.ReactNode,
  url: string,
};

export function ManifestLoader(
  {children, url}: ManifestLoaderProps
) {
  const loadManifest = useLoadManifest();
  const manifest = useManifest();

  useEffect(() => {
    loadManifest(url);
  }, [loadManifest, url]);

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