import {useManifest} from "@knaw-huc/osd-iiif-viewer";
import {useDocumentStore} from "@globalise/common/document";
import {useEffect} from "react";

export function StateDebug() {
  const manifest = useManifest();
  const document = useDocumentStore();
  useEffect(() => {
    console.debug('Manifest state:', manifest);
  }, [manifest]);

  useEffect(() => {
    console.debug('Document state:', document);
  }, [document]);

  return null;
}