import type { Manifest } from "@iiif/presentation-3";

export async function fetchManifest(url: string): Promise<Manifest> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }
  const manifest: Manifest = await response.json();
  return manifest;
}
