import { parseXml } from "@rgrove/parse-xml";

import { select } from "d3-selection";
import { polygonHull } from "d3-polygon";
import { line, curveLinearClosed } from "d3-shape";
import { pointsOnPath } from "points-on-path";

var svgbody = select("body")
  .append("svg")
  .attr("id", "svgbody")
  .attr("width", 4000)
  .attr("height", 5500);
//.attr("viewbox", "0 0 20 10")

const boundingBox = (points) => {
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

    min_x = min_x == null || x < min_x ? x : min_x;
    min_y = min_y == null || y < min_y ? y : min_y;
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

const distance = (a, b) =>
  Math.sqrt(Math.pow(a[0] - b[0], 2) + Math.pow(a[1] - b[1], 2));

const radius = (a, b) => Math.atan2(b[1] - a[1], b[0] - a[0]);

const highest_segments = (points) => {
  // get the point with the highest y value and return the two adjacent points

  const seg = [];

  let highest = [0, 0];
  let highest_index = null;

  points.forEach((p, i) => {
    if (p[1] > highest[1]) {
      highest = p;
      highest_index = i;
    }
  });

  // add the previous point. add the last if it's not there

  if (highest_index > 0) seg.push(points[highest_index - 1]);
  else seg.push(points[points.length - 1]);

  // add the highest point

  seg.push(highest);

  // if the next point is beyond the length, add the first point

  if (points.length > highest_index + 1) seg.push(points[highest_index + 1]);
  else seg.push(points[0]);

  return seg;
};

const renderWord = (text, coords, container) => {
  let scale = 1; //0.3
  //document.getElementById("svgbody").style.transform = "scale(0.3)"

  const path = "M" + coords + "Z";

  const coordarr = [];
  for (const pair of coords.split(" ")) {
    const p = pair.split(",");
    p[0] = parseInt(p[0]);
    p[1] = parseInt(p[1]);

    coordarr.push(p);
  }

  const hull = polygonHull(coordarr);

  // get the two segments that connect the 'highest' (lowest) point
  const seg = highest_segments(hull);

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
  //c.style.border = "dashed 1px blue"

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

  const cur = line().curve(curveLinearClosed);

  svgbody
    .append("path")
    .attr("d", cur(hull))
    .attr("stroke", "black")
    .attr("fill", "white")
    .attr("stroke-width", 1);

  const lines = line();

  svgbody
    .append("path")

    .attr("d", lines(seg))
    .attr("stroke", "red")
    .attr("fill", "white")
    .attr("stroke-width", 1);
};

// https://dev.to/jankapunkt/make-text-fit-it-s-parent-size-using-javascript-m40

//const isOverflown = ({ clientHeight, scrollHeight }) => scrollHeight > clientHeight
const isOverflown = ({
  clientWidth,
  clientHeight,
  scrollWidth,
  scrollHeight,
}) => scrollWidth > clientWidth;
//const isOverflown = ({ clientWidth, clientHeight, scrollWidth, scrollHeight }) => (scrollWidth > clientWidth) || (scrollHeight > clientHeight)

const resizeText = (el, minSize = 1, maxSize = 150, step = 1, unit = "px") => {
  {
    let i = minSize;
    let overflow = false;

    const parent = el.parentNode;

    while (!overflow && i < maxSize) {
      el.style.fontSize = `${i}${unit}`;
      overflow = isOverflown(parent);

      if (!overflow) i += step;
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
    if (mut.type == "childList") {
      for (const ad of mut.addedNodes) {
        if (ad.className == "text") {
          resizeText(ad);
          // TODO: remember the font weight and use it as a starting point for the next
        }
      }
    }
  }
});

const container = document.createElement("DIV");
document.body.appendChild(container);

observer.observe(container, {
  attributes: false,
  childList: true,
  subtree: true,
});

fetch("./data/3598_selection/NL-HaNA_1.04.02_3598_0797.xml")
  .then((response) => response.text())
  .then((data) => {
    const xml = parseXml(data);

    const regions = xml.children[0].children
      .filter((x) => x["name"] == "Page")[0]
      .children.filter((x) => x["name"] == "TextRegion");

    for (const region of regions) {
      const lines = region.children.filter((x) => x["name"] == "TextLine");

      for (const line of lines) {
        const words = line.children.filter((x) => x["name"] == "Word");
        for (const word of words) {
          const coords = word.children.filter((x) => x["name"] == "Coords")[0]
            .attributes["points"];

          const text = word.children
            .filter((x) => x["name"] == "TextEquiv")[0]
            .children.filter((x) => x["name"] == "Unicode")[0].children[0].text;

          renderWord(text, coords, container);
        }
      }
    }
  });

if (DEV) {
  new EventSource("/esbuild").addEventListener("change", () =>
    location.reload(),
  );
}
