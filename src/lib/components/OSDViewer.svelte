<script lang="ts">
  import { onMount } from "svelte";
  import OpenSeadragon from "openseadragon";
  import { getImageUrl, getAnnotationLabel } from "../utils";

  const { canvasData = null } = $props();
  const infoJsonUrl = $derived(getImageUrl(canvasData));
  const annotationsUrl = $derived(canvasData?.annotations?.[0]?.id || null);

  let viewer: OpenSeadragon.Viewer;
  let container: HTMLDivElement;
  let svgLayer: SVGSVGElement;
  let overlayWrapper: HTMLDivElement;
  let tooltipEl: HTMLDivElement;

  let imageWidth = 0;
  let imageHeight = 0;
  let annos: any[] = [];
  let overlayAdded = false;
  let lastHoverPath: SVGPathElement | null = null;

  let currentCanvasId: string | null = null;

  const extractPathD = (value: string): string | null => {
    const m = value.match(/<path[^>]*d=["']([^"']+)["']/i);
    return m ? m[1] : null;
  };

  const loadAnnotations = async () => {
    if (!annotationsUrl) {
      annos = [];
      renderAnnotations();
      return;
    }

    try {
      const res = await fetch(annotationsUrl);
      const page = await res.json();
      annos = Array.isArray(page?.items) ? page.items : [];
      renderAnnotations();
    } catch (e) {
      console.error("Failed to load annotations", e);
      annos = [];
      renderAnnotations();
    }
  };

  const renderAnnotations = () => {
    if (!svgLayer) return;

    svgLayer.innerHTML = "";

    if (!annos.length || !imageWidth || !imageHeight) return;

    for (const ann of annos) {
      const targets = Array.isArray(ann?.target) ? ann.target : [];
      const spec = targets.find(
        (t: any) => t?.selector?.type === "SvgSelector"
      );
      const raw = spec?.selector?.value as string | undefined;

      if (!raw) continue;
      const d = extractPathD(raw);

      if (!d) continue;
      const path = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "path"
      );

      path.setAttribute("d", d);

      path.setAttribute("fill", "rgba(255,0,0,0.0)");
      path.dataset.label = getAnnotationLabel(ann);
      path.dataset.annId = ann.id || "";
      svgLayer.appendChild(path);
    }

    ensureOverlay();
    updateOverlayPlacement();
  };

  const ensureOverlay = () => {
    if (overlayAdded || !viewer || !imageWidth || !imageHeight) return;

    const item = viewer.world.getItemAt(0);

    if (!item) return;

    const rect = item.imageToViewportRectangle(0, 0, imageWidth, imageHeight);
    viewer.addOverlay({ element: overlayWrapper, location: rect });
    overlayAdded = true;
  };

  const updateOverlayPlacement = () => {
    if (!overlayAdded || !viewer || !imageWidth || !imageHeight) return;

    const item = viewer.world.getItemAt(0);

    if (!item) return;

    const rect = item.imageToViewportRectangle(0, 0, imageWidth, imageHeight);
    viewer.updateOverlay(overlayWrapper, rect);
  };

  const initHandlers = () => {
    viewer.addHandler("animation", updateOverlayPlacement);
    viewer.addHandler("open", () => {
      const item = viewer.world.getItemAt(0);
      if (!item) return;
      const size = item.getContentSize();
      imageWidth = size.x;
      imageHeight = size.y;
      svgLayer.setAttribute("viewBox", `0 0 ${imageWidth} ${imageHeight}`);
      svgLayer.setAttribute("width", String(imageWidth));
      svgLayer.setAttribute("height", String(imageHeight));
      loadAnnotations();
      ensureOverlay();
      updateOverlayPlacement();
    });
  };

  const onPointerMove = (e: MouseEvent) => {
    if (!svgLayer) return;
    const el = (e.target as Element)
      ? ((e.target as Element).closest("path") as SVGPathElement | null)
      : null;
    if (el) {
      if (lastHoverPath && lastHoverPath !== el) {
        // Reset previous to base style
        lastHoverPath.removeAttribute("stroke");
        lastHoverPath.setAttribute("fill", "rgba(255,0,0,0.0)");
      }
      lastHoverPath = el;
      const label = el.dataset.label || "";
      tooltipEl.textContent = label;
      tooltipEl.style.display = label ? "block" : "none";
      tooltipEl.style.left = e.clientX + 12 + "px";
      tooltipEl.style.top = e.clientY + 12 + "px";
      // Hover style: semi-transparent black fill (like OLViewer hoverStyle)
      el.removeAttribute("stroke");
      el.setAttribute("fill", "rgba(0,0,0,0.15)");
    } else {
      tooltipEl.style.display = "none";
      if (lastHoverPath) {
        lastHoverPath.removeAttribute("stroke");
        lastHoverPath.setAttribute("fill", "rgba(255,0,0,0.0)");
        lastHoverPath = null;
      }
    }
  };

  onMount(() => {
    viewer = OpenSeadragon({
      element: container,
      tileSources: [],
      gestureSettingsMouse: { clickToZoom: false },
      prefixUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/openseadragon/2.4.2/images/",
      // @ts-ignore
      silenceMultiImageWarnings: true,
      crossOriginPolicy: "Anonymous",
    });
    initHandlers();

    // Listen on svg overlay for precise hit targets
    container.addEventListener("pointermove", onPointerMove);
  });

  $effect(() => {
    if (infoJsonUrl) {
      viewer.open(infoJsonUrl);
    } else if (viewer) {
      viewer.close();
      annos = [];
      renderAnnotations();
    }
  });

  $effect(() => {
    if (viewer && annotationsUrl) {
      loadAnnotations();
    } else if (viewer) {
      annos = [];
      renderAnnotations();
    }
  });

  $effect(() => {
    const newId = canvasData?.id || null;
    if (!viewer) return;
    if (newId !== currentCanvasId) {
      // Remove existing overlay so a fresh one is added for the new image dimensions
      if (overlayAdded) {
        try {
          viewer.removeOverlay(overlayWrapper);
        } catch (e) {
          // ignore
        }
      }
      overlayAdded = false;
      imageWidth = 0;
      imageHeight = 0;
      if (svgLayer) {
        svgLayer.innerHTML = "";
        svgLayer.setAttribute("viewBox", "0 0 0 0");
      }
      annos = [];
      currentCanvasId = newId;

      if (annotationsUrl) {
        loadAnnotations();
      }
    }
  });
</script>

<div
  bind:this={container}
  class="w-full h-full border border-gray-300 relative overflow-hidden"
>
  <!-- Unified SVG overlay for all annotation shapes -->
  <div
    bind:this={overlayWrapper}
    class="w-full h-full"
    style="z-index:1000; pointer-events:auto;"
  >
    <svg
      bind:this={svgLayer}
      class="pointer-events-auto select-none"
      style="width:100%; height:100%; touch-action:none;"
    ></svg>
  </div>
  <div
    bind:this={tooltipEl}
    class="pointer-events-none text-xs"
    style="display:none; position:fixed; z-index:1000; background:rgba(20,20,20,0.85); color:#fff; padding:4px 6px; border-radius:4px; font-family:system-ui, sans-serif; font-size:12px; white-space:nowrap;"
  ></div>
</div>
