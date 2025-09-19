import OpenSeadragon from "openseadragon";

const URL =
  "https://globalise-huygens.github.io/document-view-sandbox/iiif/manifest.json";

let viewer;
let currentCanvasIndex = 0;
let manifest;

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

const createThumbnails = (manifest) => {
  const thumbnailsContainer = document.getElementById("thumbnails");
  thumbnailsContainer.innerHTML = "";

  manifest.items.forEach((canvas, index) => {
    const thumbnailDiv = document.createElement("div");
    thumbnailDiv.className = "thumbnail";
    thumbnailDiv.setAttribute("data-index", index);

    const img = document.createElement("img");
    const serviceId = canvas.items[0].items[0].body.service[0]["@id"];
    img.src = `${serviceId}/full/,150/0/default.jpg`;
    img.alt = canvas.label.en[0];
    img.title = canvas.label.en[0];

    const label = document.createElement("div");
    label.className = "thumbnail-label";
    label.textContent = canvas.label.en[0];

    thumbnailDiv.appendChild(img);
    thumbnailDiv.appendChild(label);

    thumbnailDiv.addEventListener("click", () => {
      loadCanvas(index);
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

  ap.items
    .filter((a) => a.motivation === "supplementing")
    .forEach((annotation) => {
      const textual = annotation.body.find((b) => b.type === "TextualBody");
      if (!textual) return;

      const text = textual.value;

      if (annotation.textGranularity === "line") {
        transcriptionContent.innerHTML += `<span>${text}</span><br/>`;
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

const loadCanvas = (index) => {
  currentCanvasIndex = index;
  const selectedCanvas = manifest.items[index];
  const infoJsonUrl =
    selectedCanvas.items[0].items[0].body.service[0]["@id"] + "/info.json";

  if (viewer) {
    viewer.clearOverlays();
  }
  viewer.open(infoJsonUrl);
  updateActiveThumbnail(index);

  viewer.addOnceHandler("open", () => {
    const apUrlTranscriptions =
      selectedCanvas.annotations && selectedCanvas.annotations[0]
        ? selectedCanvas.annotations[0].id
        : null;
    loadTranscription(apUrlTranscriptions);
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
    loadCanvas(currentCanvasIndex + 1);
  }
};

const navigateToPrevious = () => {
  if (currentCanvasIndex > 0) {
    loadCanvas(currentCanvasIndex - 1);
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

  createThumbnails(manifest);

  const apUrlTranscriptions =
    selectedCanvas.annotations && selectedCanvas.annotations[0]
      ? selectedCanvas.annotations[0].id
      : null;
  loadTranscription(apUrlTranscriptions);

  setupKeyboardNavigation();
};

document.addEventListener("DOMContentLoaded", async function () {
  await load();
});

if (DEV) {
  new EventSource("/esbuild").addEventListener("change", () =>
    location.reload()
  );
}
