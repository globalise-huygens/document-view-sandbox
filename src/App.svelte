<script lang="ts">
  import { onMount } from "svelte";

  import NavBar from "./lib/components/NavBar.svelte";
  import Metadata from "./lib/components/Metadata.svelte";

  import OSDViewer from "./lib/components/OSDViewer.svelte";
  import OLViewer from "./lib/components/OLViewer.svelte";
  import CanvasPanelViewer from "./lib/components/CanvasPanelViewer.svelte";
  import CloverViewer from "./lib/components/CloverViewer.svelte";
  import Carousel from "./lib/components/Carousel.svelte";

  import Transcription from "./lib/components/Transcription.svelte";

  let selectedViewer = $state("openseadragon");
  let selectedCanvas: any = $state(null);
  let manifest: any = $state(null);

  const urlParams = new URLSearchParams(window.location.search);
  const manifestUrl = urlParams.get("manifest");

  let loaded = $state(false);

  onMount(async () => {
    selectedViewer = urlParams.get("viewer") || "openseadragon";

    if (manifestUrl) {
      const response = await fetch(manifestUrl);
      manifest = await response.json();

      // Select first canvas by default
      if (manifest?.items?.length > 0) {
        selectedCanvas = manifest.items[0];
        selectedCanvas["partOf"] = manifest["id"];

        loaded = true;
      }
    }
  });

  const handleViewerChange = (viewer: string) => {
    selectedViewer = viewer;
  };

  const handleCanvasSelect = (canvas: any) => {
    selectedCanvas = canvas;
    selectedCanvas["partOf"] = manifest["id"];
  };

  const getImageUrl = (canvas: any, size = "full") => {
    const imageId = canvas.items[0].items[0].body.id;
    if (size === "thumb") {
      return imageId.replace(
        "full/full/0/default.jpg",
        "full/122,/0/default.jpg"
      );
    }
    return imageId.replace("full/full/0/default.jpg", "info.json");
  };

  const getCanvasLabel = (canvas: any) => {
    return canvas?.label?.en?.[0] || canvas?.label?.none?.[0] || "Untitled";
  };
</script>

<NavBar onViewerChange={handleViewerChange} bind:selectedViewer />

<main>
  {#if !loaded}{:else}
    <div class="grid gap-4 p-4 md:grid-cols-2">
      <div class="md:col-span-2 p-4 border border-gray-300 text-sm">
        <Metadata />
      </div>
      <div class="min-h-[512px]">
        {#if selectedViewer === "openseadragon"}
          <OSDViewer
            infoJsonUrl={selectedCanvas ? getImageUrl(selectedCanvas) : null}
          />
        {:else if selectedViewer === "openlayers"}
          <OLViewer
            infoJsonUrl={selectedCanvas ? getImageUrl(selectedCanvas) : null}
          />
        {:else if selectedViewer === "canvaspanel"}
          <CanvasPanelViewer canvasData={selectedCanvas} />
        {:else if selectedViewer === "clover"}
          <CloverViewer />
        {/if}
      </div>
      <div class="p-4 border border-gray-300 font-mono leading-6">
        <Transcription />
      </div>
    </div>
  {/if}

  {#if manifest?.items}
    <Carousel
      items={manifest.items}
      selectedId={selectedCanvas?.id}
      onSelect={handleCanvasSelect}
      {getImageUrl}
      {getCanvasLabel}
    />
  {/if}
</main>
