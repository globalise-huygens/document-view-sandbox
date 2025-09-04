<script lang="ts">
  import { onMount } from "svelte";

  let manifestUrl = "";
  let selectedViewer = "openseadragon";

  export { selectedViewer };
  export let onViewerChange: (viewer: string) => void = () => {};

  onMount(() => {
    const urlParams = new URLSearchParams(window.location.search);
    manifestUrl =
      urlParams.get("manifest") ||
      "https://globalise-huygens.github.io/document-view-sandbox/iiif/manifest.json";
    selectedViewer = urlParams.get("viewer") || "openseadragon";
  });

  const loadManifest = () => {
    const params = new URLSearchParams(window.location.search);
    if (manifestUrl) {
      params.set("manifest", manifestUrl);
    } else {
      params.delete("manifest");
    }
    params.set("viewer", selectedViewer);
    window.history.replaceState({}, "", `?${params.toString()}`);

    onViewerChange(selectedViewer);

    window.location.reload();
  };

  const selectViewer = (viewer: string) => {
    selectedViewer = viewer;
    const params = new URLSearchParams(window.location.search);
    params.set("viewer", viewer);
    window.history.replaceState({}, "", `?${params.toString()}`);

    onViewerChange(viewer);
  };
</script>

<nav
  class="flex items-center gap-4 p-3 border-b border-gray-300 sticky top-0 bg-white"
>
  <div class="flex items-center gap-2 flex-1">
    <input
      type="text"
      placeholder="Enter manifest URL"
      bind:value={manifestUrl}
      class="flex-1 max-w-[600px] border border-gray-400 px-2 py-2"
    />
    <button
      onclick={loadManifest}
      class="whitespace-nowrap border border-gray-700 px-3 py-2"
    >
      Load
    </button>
  </div>

  <div class="flex gap-2">
    <button
      class={(selectedViewer === "openseadragon"
        ? "border-black"
        : "border-gray-600") + " border px-3 py-2"}
      onclick={() => selectViewer("openseadragon")}
    >
      OpenSeadragon
    </button>
    <button
      class={(selectedViewer === "openlayers"
        ? "border-black"
        : "border-gray-600") + " border px-3 py-2"}
      onclick={() => selectViewer("openlayers")}
    >
      OpenLayers
    </button>
    <button
      class={(selectedViewer === "canvaspanel"
        ? "border-black"
        : "border-gray-600") + " border px-3 py-2"}
      onclick={() => selectViewer("canvaspanel")}
    >
      CanvasPanel
    </button>
    <button
      class={(selectedViewer === "clover"
        ? "border-black"
        : "border-gray-600") + " border px-3 py-2"}
      onclick={() => selectViewer("clover")}
    >
      Clover
    </button>
  </div>
</nav>
