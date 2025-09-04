<script lang="ts">
  import { onMount } from "svelte";
  import OpenSeadragon from "openseadragon";

  const { infoJsonUrl = null } = $props<{
    infoJsonUrl?: string | null;
  }>();

  let viewer: OpenSeadragon.Viewer;
  let container: HTMLDivElement;

  onMount(() => {
    viewer = OpenSeadragon({
      element: container,
      tileSources: [],
      gestureSettingsMouse: {
        clickToZoom: false,
      },
      prefixUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/openseadragon/2.4.2/images/",
      // @ts-ignore
      silenceMultiImageWarnings: true,
      crossOriginPolicy: "Anonymous",
    });
  });

  $effect(() => {
    if (infoJsonUrl) {
      viewer.open(infoJsonUrl);
    } else {
      viewer.close();
    }
  });
</script>

<div bind:this={container} class="w-full h-full border border-gray-300"></div>
