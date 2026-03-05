import {useEffect} from 'react';
import {
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

  const {isLoading, error, isReady} = useManifest();

  useEffect(() => {
    loadManifest(url);
  }, [loadManifest, url]);

  if (isLoading) {
    return <>Loading manifest...</>;
  }
  if (error) {
    return <>Error: {error}</>;
  }
  if (!isReady) {
    return null;
  }

  return <>{children}</>;
}