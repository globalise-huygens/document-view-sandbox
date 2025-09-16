<script lang="ts">
  import { onMount } from "svelte";
  import Map from "ol/Map.js";
  import View from "ol/View.js";
  import IIIFInfo from "ol/format/IIIFInfo.js";
  import TileLayer from "ol/layer/Tile.js";
  import IIIF from "ol/source/IIIF.js";
  import "ol/ol.css";

  import { getImageUrl, getAnnotationLabel } from "../utils";
  import VectorLayer from "ol/layer/Vector.js";
  import VectorSource from "ol/source/Vector.js";
  import Feature from "ol/Feature.js";
  import Polygon from "ol/geom/Polygon.js";
  import type Geometry from "ol/geom/Geometry.js";
  import Style from "ol/style/Style.js";
  import Stroke from "ol/style/Stroke.js";
  import Fill from "ol/style/Fill.js";
  import Overlay from "ol/Overlay.js";
  import { unByKey } from "ol/Observable.js";

  const { canvasData = null } = $props();

  const infoJsonUrl = $derived(getImageUrl(canvasData));
  const annotationsUrl = $derived(canvasData?.annotations?.[0]?.id || null);

  let map: Map;
  let container: HTMLDivElement;
  let layer: TileLayer<IIIF>;
  let annoLayer: VectorLayer<VectorSource>;
  let tooltip: Overlay;
  let tooltipEl: HTMLDivElement;
  let moveKey: any;
  let lastHover: Feature<Geometry> | null = null;

  const baseStyle = new Style({
    // stroke: new Stroke({ color: "rgba(255,0,0,0.8)", width: 1 }),
    fill: new Fill({ color: "rgba(255,0,0,0.0)" }),
  });

  const hoverStyle = new Style({
    // stroke: new Stroke({ color: "rgba(0,153,255,1)", width: 2 }),
    fill: new Fill({ color: "rgba(0,0,0,0.15)" }),
  });

  onMount(() => {
    layer = new TileLayer();
    annoLayer = new VectorLayer({
      source: new VectorSource(),
      style: baseStyle,
    });

    map = new Map({
      layers: [layer, annoLayer],
      target: container,
    });

    // Tooltip overlay
    tooltip = new Overlay({
      element: tooltipEl,
      offset: [10, 10],
      positioning: "bottom-left",
      stopEvent: false,
    });
    map.addOverlay(tooltip);

    // Hover handling
    moveKey = map.on("pointermove", (evt) => {
      if (!map) return;
      const pixel = evt.pixel;
      let found: Feature | null = null;
      map.forEachFeatureAtPixel(
        pixel,
        (f, l) => {
          if (l === annoLayer) {
            found = f as Feature<Geometry>;
          }
          return found;
        },
        { hitTolerance: 2 }
      );

      if (found) {
        if (lastHover && lastHover !== found) {
          lastHover.setStyle(undefined);
        }
        lastHover = found as Feature<Geometry>;
        lastHover.setStyle(hoverStyle);

        const ann: any = (found as Feature<Geometry>).get("annotation");
        const label = getAnnotationLabel(ann);

        tooltipEl.textContent = label;
        tooltipEl.style.display = "block";
        tooltip.setPosition(evt.coordinate);
      } else {
        if (lastHover) {
          lastHover.setStyle(undefined);
          lastHover = null;
        }
        tooltipEl.style.display = "none";
      }
    });
  });

  const loadIIIF = async (imageInfoUrl: string) => {
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

    // After IIIF loads, (re)draw annotations if provided
    if (annotationsUrl) {
      loadAnnotations(
        annotationsUrl,
        iiifTileSource.getTileGrid()?.getExtent()
      );
    } else {
      annoLayer.getSource()?.clear();
    }
  };

  const pathToRing = (path: string, invertY = true): number[][] => {
    // Extract all coordinate pairs (absolute commands assumed)
    const coords: number[][] = [];
    const regex = /(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/g;
    let m: RegExpExecArray | null;
    while ((m = regex.exec(path))) {
      const x = parseFloat(m[1]);
      const y = parseFloat(m[2]);
      coords.push([x, invertY ? -y : y]);
    }
    // Ensure ring is closed
    if (coords.length > 2) {
      const first = coords[0];
      const last = coords[coords.length - 1];
      if (first[0] !== last[0] || first[1] !== last[1]) {
        coords.push([...first]);
      }
    }
    return coords;
  };

  const loadAnnotations = async (url: string, extent?: number[]) => {
    try {
      const res = await fetch(url);
      const page = await res.json();
      const items = Array.isArray(page?.items) ? page.items : [];
      const source = annoLayer.getSource();
      source?.clear();

      // Determine whether we need to invert Y.
      // If extent is [minX, minY, maxX, maxY] with maxY === 0, minY === -height, we should invert.
      const invertY = extent ? extent[3] === 0 : true;

      const features: Feature[] = [];
      for (const ann of items) {
        const targets = Array.isArray(ann?.target) ? ann.target : [];
        const spec = targets.find(
          (t: any) => t?.selector?.type === "SvgSelector"
        );
        const d = spec?.selector?.value as string | undefined;
        if (!d) continue;

        const ring = pathToRing(d, invertY);
        if (ring.length >= 4) {
          const poly = new Polygon([ring]);
          const f = new Feature({ geometry: poly, annotation: ann });
          features.push(f);
        }
      }
      if (features.length) {
        source?.addFeatures(features);
      }
    } catch (e) {
      console.error("Failed to load annotations", e);
      annoLayer.getSource()?.clear();
    }
  };

  $effect(() => {
    if (infoJsonUrl && map) {
      loadIIIF(infoJsonUrl);
    } else if (map && layer) {
      layer.setSource(null);
      annoLayer.getSource()?.clear();
      if (moveKey) unByKey(moveKey);
    }
  });

  $effect(() => {
    const src = layer?.getSource();
    if (annotationsUrl && src) {
      const tileGrid = (src as IIIF).getTileGrid();
      loadAnnotations(annotationsUrl, tileGrid?.getExtent());
    } else if (annoLayer) {
      annoLayer.getSource()?.clear();
    }
  });
</script>

<div
  bind:this={container}
  class="w-full h-full border border-gray-300 relative"
></div>

<!-- Tooltip element for OL overlay -->
<div
  bind:this={tooltipEl}
  style="display:none; position:absolute; background:rgba(20,20,20,0.85); color:#fff; padding:4px 6px; border-radius:4px; font-size:12px; pointer-events:none; white-space:nowrap;"
></div>
