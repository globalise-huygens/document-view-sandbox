<script lang="ts">
  import { onMount } from "svelte";
  import Map from "ol/Map.js";
  import View from "ol/View.js";
  import IIIFInfo from "ol/format/IIIFInfo.js";
  import TileLayer from "ol/layer/Tile.js";
  import IIIF from "ol/source/IIIF.js";
  import "ol/ol.css";

  const { infoJsonUrl = null } = $props();

  let map: Map;
  let container: HTMLDivElement;
  let layer: TileLayer<IIIF>;

  onMount(() => {
    layer = new TileLayer();

    map = new Map({
      layers: [layer],
      target: container,
    });
  });

  const loadIIIF = async (imageInfoUrl: string) => {
    try {
      const response = await fetch(imageInfoUrl);
      const imageInfo = await response.json();

      const options = new IIIFInfo(imageInfo).getTileSourceOptions();
      if (options === undefined || options.version === undefined) {
        console.error("Data seems to be no valid IIIF image information.");
        return;
      }

      options.zDirection = -1;
      const iiifTileSource = new IIIF(options);
      layer.setSource(iiifTileSource);

      const tileGrid = iiifTileSource.getTileGrid();
      if (tileGrid) {
        map.setView(
          new View({
            resolutions: tileGrid.getResolutions(),
            extent: tileGrid.getExtent(),
            constrainOnlyCenter: true,
          })
        );

        map.getView().fit(tileGrid.getExtent());
      }
    } catch (error) {
      console.error("Could not load IIIF image:", error);
    }
  };

  $effect(() => {
    if (infoJsonUrl && map) {
      loadIIIF(infoJsonUrl);
    } else if (map && layer) {
      layer.setSource(null);
    }
  });
</script>

<div bind:this={container} class="w-full h-full border border-gray-300"></div>
