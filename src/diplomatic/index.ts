import { parseXml, XmlElement, XmlText } from "@rgrove/parse-xml";

import { select } from "d3-selection";
import { polygonHull } from "d3-polygon";
import { line, curveLinearClosed } from "d3-shape";
import { isXmlElement } from "./isXmlElement";
import { assertXmlElement } from "./assertXmlElement";
import { assertXmlText } from "./assertXmlText";

const scale = 1;
let opacity: number;
let wOpacity: string;
let svgbody: ReturnType<typeof select<SVGSVGElement, unknown>>;

export type Point = [number, number];

const boundingBox = (points: Point[]) => {
  // find the x and y bounds from a set of points
  let max_x = null;
  let min_x = null;
  let max_y = null;
  let min_y = null;

  points.forEach((p) => {
    const x = p[0];
    const y = p[1];

      max_x = x > max_x ? x : max_x;
      max_y = y > max_y ? y : max_y;

    min_x = min_x === null || x < min_x ? x : min_x;
    min_y = min_y === null || y < min_y ? y : min_y;
  });

  return {
      x: min_x,
      y: min_y,
      x2: max_x,
      y2: max_y,
      width: max_x - min_x,
      height: max_y - min_y,
  };
};

const radius = (a: Point, b: Point) =>
  Math.atan2(b[1] - a[1], b[0] - a[0]);

function findHighestSegments(points: Point[]) {
  const segments: Point[] = [];

  let highest: Point = [0, 0];
  let highest_index: number | null = null;

  points.forEach((p, i) => {
    if (p[1] > highest[1]) {
      highest = p;
      highest_index = i;
    }
  });

  // add the previous point. add the last if it's not there

  if (highest_index > 0) {
    segments.push(points[highest_index - 1]);
  } else {
    segments.push(points[points.length - 1]);
  }

  // add the highest point

  segments.push(highest);

  // if the next point is beyond the length, add the first point

  if (points.length > highest_index + 1) {
    segments.push(points[highest_index + 1]);
  } else {
    segments.push(points[0]);
  }

  return segments;
}

const renderWord = (text: string, coords: string, container: HTMLElement) => {
  const coordarr: Point[] = [];
  for (const pair of coords.split(" ")) {
    const p = pair.split(",");
    coordarr.push([
      parseInt(p[0]),
      parseInt(p[1])
    ]);
  }

  const hull = polygonHull(coordarr);

  // get the two segments that connect the 'highest' (lowest) point
  const seg = findHighestSegments(hull);

  // calculate the angles of the segments and select the 'smallest'
    // TODO: is this indeed the best segment?

  const seg_rad1 = radius(seg[0], seg[1]);
  const seg_rad2 = radius(seg[1], seg[2]);
  const seg_rad = Math.abs(seg_rad1) < Math.abs(seg_rad2) ? seg_rad1 : seg_rad2;

    // TODO: first, rotate all points and then caclulate the box

  const bbox = boundingBox(hull);

  let c = document.createElement("DIV");
  container.appendChild(c);

  c.style.position = "absolute";
    c.style.border = "dashed 1px blue"

  c.style.left = bbox.x * scale + "px";
  c.style.top = bbox.y * scale + "px";
  c.style.width = bbox.width * scale + "px";
  c.style.height = bbox.height * scale + "px";

  c.style.transform = "rotate(" + seg_rad + "rad)";

  let s = document.createElement("DIV");
  c.appendChild(s);

  s.innerText = text;
  s.className = "text";

  s.style.fontFamily = "monospace";

  s.style.display = "block";
  s.style.fontSize = "8px";

  const scaledHull = hull.map(p => [p[0] * scale, p[1] * scale]);
  const scaledSeg = seg.map(p => [p[0] * scale, p[1] * scale]);

  const cur = line<Point>().curve(curveLinearClosed);

  svgbody
    .append("path")
    .attr("d", cur(scaledHull))
    .attr("stroke", "black")
    .attr("fill", "white")
    .attr("stroke-width", 1);

    const lines = line();

  svgbody
    .append("path")
    .attr("d", lines(scaledSeg))
    .attr("stroke", "red")
    .attr("fill", "white")
    .attr("stroke-width", 1);
};

// https://dev.to/jankapunkt/make-text-fit-it-s-parent-size-using-javascript-m40

  const isOverflown = ({clientWidth, scrollWidth}) => scrollWidth > clientWidth;

  const resizeText = (el, minSize = 1, maxSize = 150, step = 1, unit = "px") => {
  {
    let i = minSize;
    let overflow = false;

      const parent = el.parentNode;

    while (!overflow && i < maxSize) {
      el.style.fontSize = `${i}${unit}`;
      overflow = isOverflown(parent);

      if (!overflow) {
        i += step;
      }
    }

    // revert to last state where no overflow happened
    el.style.fontSize = `${i - step}${unit}`;

    // adjust the vertical positioning after the horizontal scaling of the font.

    const verticalAdjust = parent.clientHeight / 2 - el.clientHeight / 2;
    el.style.marginTop = `${verticalAdjust}${unit}`;
  }
};

const observer = new MutationObserver((mutationList, observer) => {
  for (const mut of mutationList) {
    if (mut.type === "childList") {
      for (const ad of mut.addedNodes) {
        if (ad instanceof HTMLElement && ad.className === "text") {
          resizeText(ad);
          // TODO: remember the font weight and use it as a starting point for the next
        }
      }
    }
  }
});

const docSelection = "3598_selection";
const docName = "NL-HaNA_1.04.02_3598_0797";

const adjustOpacity = () => {
  const opcEl = document.getElementById("opc") as HTMLInputElement;
  const imageEl = document.getElementById("pagescan") as HTMLImageElement;
  opacity = parseInt(opcEl.value);
  wOpacity = `${100 - opacity}%`;
  imageEl.style.opacity = `${opacity}%`;
  for (const div of document.getElementsByClassName("textdiv")) {
    (div as HTMLElement).style.opacity = wOpacity;
  }
};

document.addEventListener("DOMContentLoaded", () => {
  const opcEl = document.getElementById("opc") as HTMLInputElement;
  const imageEl = document.getElementById("pagescan") as HTMLImageElement;

  adjustOpacity();
  opcEl.addEventListener("change", () => {
    adjustOpacity();
  });

  svgbody = select("body")
    .append("svg")
    .attr("id", "svgbody")
    .attr("width", 4000)
    .attr("height", 5500);

  const container = document.createElement("DIV");
  document.body.appendChild(container);

  observer.observe(container, {
    attributes: false,
    childList: true,
    subtree: true,
  });

  fetch(`/data/${docSelection}/${docName}.xml`)
    .then((response) => response.text())
    .then((body) => {
      const xml = parseXml(body);
      const doc = xml.children[0];
      if(!isXmlElement(doc)) throw new Error("Expected XmlElement")
      const firstPage = doc.children
        .filter((x) => {
          return x["name"] === "Page";
        })[0];
      if(!isXmlElement(firstPage)) throw new Error("Expected XmlElement")

      const { imageFilename, imageWidth, imageHeight } = firstPage.attributes;
      const imageStyle = `
        position: absolute;
        left: 0;
        top: 0;
        width: ${scale * parseInt(imageWidth)}px;
        height: ${scale * parseInt(imageHeight)}px;
        border-style: none;
        z-index: -1;
      `;
      const bodyStyle = `
        position: absolute;
        left: 0;
        top: 0;
        width: ${scale * parseInt(imageWidth)}px;
        height: ${scale * parseInt(imageHeight)}px;
      `;

      const regions = firstPage.children.filter((x) => x["name"] === "TextRegion");

      for (const region of regions) {
        assertXmlElement(region);
        const lines = region.children
          .filter((x) => x["name"] === "TextLine");
        for (const line of lines) {
          assertXmlElement(line);
          const words = line.children
            .filter((x) => x["name"] === "Word");
          for (const word of words) {
            assertXmlElement(word);
            const coords = word.children
              .find((x) => x["name"] === "Coords");
            assertXmlElement(coords);
            const points = coords.attributes["points"];
            const textEquiv = word.children
              .find((x) => x["name"] === "TextEquiv");
            assertXmlElement(textEquiv);
            const unicode = textEquiv.children
              .find((x) => x["name"] === "Unicode");
            assertXmlElement(unicode);
            const textChild = unicode.children[0];
            assertXmlText(textChild);
            const text = textChild.text;
            renderWord(text, points, container);
          }
        }
      }

      imageEl.src = `/images/${docSelection}/${imageFilename}`;
      imageEl.style.cssText = imageStyle;

      const bodyEl = document.getElementsByTagName("body")[0];
      bodyEl.style.cssText = bodyStyle;
    });
});

if (DEV) {
  new EventSource("/esbuild").addEventListener("change", () =>
    location.reload(),
  );
}
