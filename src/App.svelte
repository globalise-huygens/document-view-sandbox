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
</script>

<div class="flex flex-col min-h-screen w-full">
  <div class="shrink-0">
    <NavBar onViewerChange={handleViewerChange} bind:selectedViewer />
  </div>

  <div class="flex flex-col flex-1 min-h-0">
    {#if !loaded}{:else}
      <div class="p-4 border border-gray-300 text-sm shrink-0">
        <Metadata />
      </div>

      <div class="flex flex-1 min-h-0 flex-col md:flex-row gap-4 p-4">
        <div
          class="flex-1 min-h-[420px] min-w-0 border border-gray-300 relative flex flex-col"
        >
          <div class="absolute inset-0">
            {#if selectedViewer === "openseadragon"}
              <OSDViewer canvasData={selectedCanvas} />
            {:else if selectedViewer === "openlayers"}
              <OLViewer canvasData={selectedCanvas} />
            {:else if selectedViewer === "canvaspanel"}
              <CanvasPanelViewer canvasData={selectedCanvas} />
            {:else if selectedViewer === "clover"}
              <CloverViewer canvasData={selectedCanvas} />
            {/if}
          </div>
        </div>

        <div
          class="flex-1 min-h-[420px] min-w-0 flex flex-col border border-gray-300 font-mono leading-6"
        >
          <div class="flex-1 overflow-auto p-4">
            <Transcription />
          </div>
        </div>
      </div>
    {/if}
  </div>
  {#if manifest?.items}
    <div class="mt-auto">
      <Carousel
        items={manifest.items}
        selectedId={selectedCanvas?.id}
        onSelect={handleCanvasSelect}
      />
    </div>
  {/if}
</div>
