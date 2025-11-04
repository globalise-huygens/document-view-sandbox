import OpenSeadragon from "openseadragon";

import { createTextAnnotator, W3CTextFormat } from "@recogito/text-annotator";

const URL = "iiif/manifest.json";

let viewer;
let currentCanvasIndex = 0;
let manifest;
let currentView = "standard";

let annotationTooltip;
const ensureTooltip = () => {
  if (!annotationTooltip) {
    annotationTooltip = document.createElement("div");
    annotationTooltip.id = "annotation-tooltip";
    annotationTooltip.style.cssText = [
      "position:absolute",
      "background:rgba(0,0,0,0.85)",
      "color:#fff",
      "padding:6px 10px",
      "border-radius:4px",
      "font:13px/1.3 system-ui, sans-serif",
      "max-width:320px",
      "pointer-events:none",
      "z-index:99999",
      "opacity:0",
      "transition:opacity .15s ease",
      "box-shadow:0 2px 6px rgba(0,0,0,.35)",
      "white-space:pre-wrap",
    ].join(";");
    document.body.appendChild(annotationTooltip);
  }
  return annotationTooltip;
};

const showTooltip = (text, evt) => {
  const tip = ensureTooltip();
  tip.textContent = text;
  tip.style.opacity = "1";
  const margin = 12;
  const rect = tip.getBoundingClientRect();
  let x = evt.clientX + margin;
  let y = evt.clientY - rect.height - margin;
  if (x + rect.width + 4 > window.innerWidth)
    x = window.innerWidth - rect.width - 4;
  if (y < 4) y = evt.clientY + margin;
  tip.style.left = x + "px";
  tip.style.top = y + "px";
};

const hideTooltip = () => {
  if (annotationTooltip) annotationTooltip.style.opacity = "0";
};

const loadManifest = async (url) => {
  const response = await fetch(url);
  const manifest = await response.json();
  return manifest;
};

const loadTableOfContents = (manifest) => {
  const tocContainer = document.getElementById("toc-content");
  tocContainer.innerHTML = "";

  manifest.structures.forEach((range) => {
    const tocItems = getTableOfContentsItems(range);
    tocItems.forEach((tocItem) => tocContainer.appendChild(tocItem));
  });
};

const getTableOfContentsItems = (range, level = 0) => {
  const items = [];

  const tocItem = document.createElement("div");
  tocItem.className = "toc-item";
  tocItem.textContent = range.label.en[0] || range.label.none[0];

  tocItem.setAttribute("data-level", level);

  items.push(tocItem);

  tocItem.addEventListener("click", () => {
    const canvasItem = (range.items || []).find((i) => i.type === "Canvas");
    if (canvasItem && canvasItem.id) {
      loadCanvasById(canvasItem.id);
    }
  });

  if (range.items && range.items.length > 0) {
    range.items.forEach((subRange) => {
      if (subRange.type === "Range") {
        items.push(...getTableOfContentsItems(subRange, level + 1));
      }
    });
  }

  return items;
};

const createThumbnails = (manifest) => {
  const thumbnailsContainer = document.getElementById("thumbnails");
  thumbnailsContainer.innerHTML = "";

  manifest.items.forEach((canvas) => {
    const thumbnailDiv = document.createElement("div");
    thumbnailDiv.className = "thumbnail";

    const img = document.createElement("img");
    const serviceId = canvas.items[0].items[0].body.service[0]["@id"];
    img.src = `${serviceId}/full/,150/0/default.jpg`;
    img.alt = canvas.label.en[0];
    img.title = canvas.label.en[0];
    img.loading = "lazy";

    const label = document.createElement("div");
    label.className = "thumbnail-label";
    label.textContent = canvas.label.en[0];

    thumbnailDiv.appendChild(img);
    thumbnailDiv.appendChild(label);

    thumbnailDiv.addEventListener("click", () => {
      loadCanvasById(canvas.id);
    });

    thumbnailsContainer.appendChild(thumbnailDiv);
  });

  updateActiveThumbnail(0);
};

const loadTranscription = async (annotationPageUrl) => {
  if (!annotationPageUrl) return;

  const response = await fetch(annotationPageUrl);
  const ap = await response.json();

  const transcriptionContent = document.getElementById("transcription-content");
  transcriptionContent.innerHTML = "";

  const item = viewer.world.getItemAt(0);
  if (!item) return;

  const size = item.getContentSize();
  const imageRect = item.imageToViewportRectangle(0, 0, size.x, size.y);

  if (currentView === "diplomatic") {
    renderDiplomaticView(ap, transcriptionContent);
  } else {
    renderStandardView(ap, transcriptionContent, item, size, imageRect);
  }
};

const renderStandardView = (
  ap,
  transcriptionContent,
  item,
  size,
  imageRect
) => {
  ap.items
    .filter((a) => a.motivation === "supplementing")
    .forEach((annotation) => {
      const textual = annotation.body.find((b) => b.type === "TextualBody");
      if (!textual) return;

      const text = textual.value;

      if (annotation.textGranularity === "page") {
        transcriptionContent.innerHTML = `<div class="page-view">${text}</div>`;
        return;
      }

      if (annotation.textGranularity === "line") {
        // transcriptionContent.innerHTML += `<span>${text}</span><br/>`;
      }

      const specific = annotation.target.find(
        (t) => t.type === "SpecificResource"
      );
      if (!specific || !specific.selector) return;

      const svgFragment = specific.selector.value;

      const svgContainer = document.createElement("div");
      svgContainer.style.position = "absolute";
      svgContainer.style.pointerEvents = "none";

      const svgElement = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "svg"
      );
      svgElement.setAttribute("viewBox", `0 0 ${size.x} ${size.y}`);
      svgElement.style.width = "100%";
      svgElement.style.height = "100%";
      svgElement.style.pointerEvents = "none";

      const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
      g.innerHTML = svgFragment;
      g.style.pointerEvents = "none";

      g.querySelectorAll(
        "path, polygon, polyline, rect, circle, ellipse"
      ).forEach((shape) => {
        shape.setAttribute("fill", "transparent");
        shape.style.pointerEvents = "auto";
        shape.style.cursor = "pointer";

        shape.addEventListener("mouseenter", (evt) => {
          showTooltip(text, evt);
          shape.dataset._origFill = shape.getAttribute("fill") || "";
          shape.dataset._origStroke = shape.getAttribute("stroke") || "";
          shape.setAttribute("fill", "rgba(0,0,0,0.15)");
        });
        shape.addEventListener("mousemove", (evt) => {
          const tip = annotationTooltip;
          if (tip && tip.style.opacity === "1") {
            showTooltip(text, evt);
          }
        });
        shape.addEventListener("mouseleave", () => {
          hideTooltip();
          shape.setAttribute("fill", "transparent");
        });
      });

      svgElement.appendChild(g);
      svgContainer.appendChild(svgElement);

      viewer.addOverlay({
        element: svgContainer,
        location: imageRect,
      });
    });
};

const renderDiplomaticView = (ap, transcriptionContent) => {
  const diplomaticContent = document.createElement("div");
  diplomaticContent.className = "diplomatic-view";
  diplomaticContent.innerHTML =
    "<p><em>Diplomatic view coming soon...</em></p>";

  transcriptionContent.appendChild(diplomaticContent);
};

const loadEntities = async (annotationPageUrl) => {
  if (!annotationPageUrl) return;

  const response = await fetch(annotationPageUrl);
  // const response = await fetch(
  //   "iiif/annotations/entities/NL-HaNA_1.04.02_3598_0797.json"
  // );
  const ap = await response.json();

  const style = (annotation, state, z) => {
    const colorMapping = {
      // Names and identifiers
      "gan:DATE": "#005f73", // Date (teal)
      "gan:DOC": "#4a90e2", // Document (blue)
      "gan:LOC_NAME": "#f7b32b", // Location Name (yellow)
      "gan:LOC_ADJ": "#f9d67a", // Location Adjective (light yellow)
      "gan:PER_NAME": "#e4572e", // Person Name (red)
      "gan:ORG_NAME": "#29335c", // Organization Name (dark blue)
      "gan:SHIP": "#3498db", // Ship name (blue)

      // Classifications and types
      "gan:SHIP_TYPE": "#5dade2", // Ship type (light blue)
      "gan:STATUS": "#9b59b6", // Civic status (purple)
      "gan:PER_ATTR": "#e74c3c", // Person attributes (red-orange)
      "gan:ETH_REL": "#d68910", // Ethno-religious (orange)

      // Commodities and quantities
      "gan:CMTY_NAME": "#27ae60", // Commodity name (green)
      "gan:CMTY_QUAL": "#52be80", // Commodity qualifier (light green)
      "gan:CMTY_QUANT": "#76b041", // Quantity (green)

      // Default fallback
    };

    const classified = annotation?.bodies?.[0]?.classified_as?.id;
    const color = colorMapping[classified] || "#00b1ff";

    return {
      fill: color,
      fillOpacity: state.hovered || state.selected ? 0.5 : 0.15,
      underlineColor: color,
      underlineOffset: z * 3.5 || 0,
      underlineThickness: 2,
    };
  };

  const transcriptionContent = document.getElementById("transcription-content");

  const anno = createTextAnnotator(transcriptionContent, {
    adapter: W3CTextFormat(
      "urn:example:placeholder/contents",
      transcriptionContent
    ),
    allowModifierSelect: true,
    renderer: "SPANS",
    annotatingEnabled: false,
    selectionMode: "all",
    style,
  });

  for (let annotation of ap.items) {
    if (annotation.motivation !== "classifying") continue;

    console.log("Adding entity annotation", annotation);

    anno.addAnnotation({
      id: annotation.id,
      body: annotation.body,
      target: [annotation.target[0]],
    });
  }
};

const loadCanvasById = (canvasId) => {
  const index = manifest.items.findIndex((c) => c.id === canvasId);

  currentCanvasIndex = index;
  const selectedCanvas = manifest.items[index];
  const infoJsonUrl =
    selectedCanvas.items[0].items[0].body.service[0]["@id"] + "/info.json";

  if (viewer) {
    viewer.clearOverlays();
  }
  viewer.open(infoJsonUrl);
  updateActiveThumbnail(index);

  viewer.addOnceHandler("open", async () => {
    const apUrlTranscriptions =
      selectedCanvas.annotations && selectedCanvas.annotations[0]
        ? selectedCanvas.annotations[0].id
        : null;

    const apUrlEntities =
      selectedCanvas.annotations && selectedCanvas.annotations[1]
        ? selectedCanvas.annotations[1].id
        : null;

    console.log(selectedCanvas.annotations);

    // Ensure entities load only after transcription has fully rendered
    await loadTranscription(apUrlTranscriptions);
    await loadEntities(apUrlEntities);
  });
};

const updateActiveThumbnail = (index) => {
  const thumbnails = document.querySelectorAll(".thumbnail");
  thumbnails.forEach((thumb) => thumb.classList.remove("active"));
  thumbnails[index].classList.add("active");

  const activeThumbnail = thumbnails[index];
  if (activeThumbnail) {
    activeThumbnail.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });
  }
};

const navigateToNext = () => {
  if (currentCanvasIndex < manifest.items.length - 1) {
    loadCanvasById(manifest.items[currentCanvasIndex + 1].id);
  }
};

const navigateToPrevious = () => {
  if (currentCanvasIndex > 0) {
    loadCanvasById(manifest.items[currentCanvasIndex - 1].id);
  }
};

const setupKeyboardNavigation = () => {
  document.addEventListener("keydown", (event) => {
    if (
      document.activeElement.tagName === "INPUT" ||
      document.activeElement.tagName === "TEXTAREA"
    ) {
      return;
    }

    switch (event.key) {
      case "ArrowLeft":
        event.preventDefault();
        navigateToPrevious();
        break;
      case "ArrowRight":
        event.preventDefault();
        navigateToNext();
        break;
    }
  });
};

const setupViewToggle = () => {
  const toggleButtons = document.querySelectorAll(".toggle-btn");

  toggleButtons.forEach((button) => {
    button.addEventListener("click", () => {
      // Update active state
      toggleButtons.forEach((btn) => btn.classList.remove("active"));
      button.classList.add("active");

      // Update current view
      currentView = button.dataset.view;

      // Reload the current canvas to apply new view
      if (manifest && manifest.items[currentCanvasIndex]) {
        loadCanvasById(manifest.items[currentCanvasIndex].id);
      }
    });
  });
};

const load = async () => {
  manifest = await loadManifest(URL);

  const selectedCanvas = manifest.items[0];
  const infoJsonUrl =
    selectedCanvas.items[0].items[0].body.service[0]["@id"] + "/info.json";

  viewer = OpenSeadragon({
    id: "viewer",
    prefixUrl: "https://openseadragon.github.io/openseadragon/images/",
    tileSources: [infoJsonUrl],
    crossOriginPolicy: "Anonymous",
  });

  loadTableOfContents(manifest);

  createThumbnails(manifest);

  setupKeyboardNavigation();

  setupViewToggle();
};

document.addEventListener("DOMContentLoaded", async function () {
  await load();
});

if (DEV) {
  new EventSource("/esbuild").addEventListener("change", () =>
    location.reload()
  );
}
