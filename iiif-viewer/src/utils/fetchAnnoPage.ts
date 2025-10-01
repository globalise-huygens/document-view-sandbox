import type { AnnotationPage, Manifest } from "@iiif/presentation-3";

export async function fetchAnnoPage(
  manifest: Manifest
): Promise<AnnotationPage | null> {
  const annoPageUrl = manifest.items[0].annotations?.[0].id;
  if (!annoPageUrl) return null;

  const response = await fetch(annoPageUrl);
  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }
  const annoPage: AnnotationPage = await response.json();

  return annoPage;
}
