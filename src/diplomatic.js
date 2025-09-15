import { parseXml } from "@rgrove/parse-xml"
import SVGPathCommander from "svg-path-commander"
import { select } from "d3-selection"

// const canvas = document.createElement("CANVAS")
// document.body.appendChild(canvas)
// canvas.style.width = "400px"
// canvas.style.height = "600px"

// const ctx = canvas.getContext("2d");
// ctx.fillStyle = "black";
// ctx.font = "23px monospace";

const scale = 0.3
let opacity
let wOpacity
let imageStyle

const renderWord = (text, coords, container) => {
  const path = "M" + coords + "Z"
  let pathcom = new SVGPathCommander(path)

  let c = document.createElement("DIV")
  container.appendChild(c)
  c.style.position = "absolute"
  //c.style.border = "dashed 1px blue"

  c.style.left = pathcom.bbox.x * scale + "px"
  c.style.top = pathcom.bbox.y * scale + "px"
  c.style.width = pathcom.bbox.width * scale + "px"
  c.style.height = pathcom.bbox.height * scale + "px"
  c.style.opacity = wOpacity
  c.className = "textdiv"

  let s = document.createElement("DIV")
  c.appendChild(s)

  s.innerText = text
  s.className = "text"
  //s.style.border = "dashed 1px red"

  //s.style.fontFamily =  "Times, Georgia, serif"
  s.style.fontFamily = "monospace"

  s.style.display = "block"
  s.style.fontSize = "20px"

  //const svg = select("body").append("svg")
  //	  .append("path")
  //	  .attr("d", path)
  //	  .attr("stroke-width", 2)
  //		  .attr("stroke", "red")

  //ctx.stroke(new Path2D(path))
  //ctx.rect(pathcom.bbox.x, pathcom.bbox.y, pathcom.bbox.width, pathcom.bbox.height)
  //ctx.stroke()

  //ctx.fillText(word, pathcom.bbox.x, pathcom.bbox.y + pathcom.bbox.height);
}

// https://dev.to/jankapunkt/make-text-fit-it-s-parent-size-using-javascript-m40

//const isOverflown = ({ clientHeight, scrollHeight }) => scrollHeight > clientHeight
const isOverflown = ({ clientWidth, clientHeight, scrollWidth, scrollHeight }) =>
  scrollWidth > clientWidth
//const isOverflown = ({ clientWidth, clientHeight, scrollWidth, scrollHeight }) => (scrollWidth > clientWidth) || (scrollHeight > clientHeight)

const resizeText = (el, minSize = 1, maxSize = 150, step = 1, unit = "px") => {
  {
    let i = minSize
    let overflow = false

    const parent = el.parentNode

    while (!overflow && i < maxSize) {
      el.style.fontSize = `${i}${unit}`
      overflow = isOverflown(parent)

      if (!overflow) i += step
    }

    // revert to last state where no overflow happened
    el.style.fontSize = `${i - step}${unit}`

    // adjust the vertical positioning after the horizontal scaling of the font.

    const verticalAdjust = parent.clientHeight / 2 - el.clientHeight / 2
    el.style.marginTop = `${verticalAdjust}${unit}`
  }
}

const observer = new MutationObserver((mutationList, observer) => {
  for (const mut of mutationList) {
    if (mut.type == "childList") {
      for (const ad of mut.addedNodes) {
        if (ad.className == "text") {
          resizeText(ad)
          // TODO: remember the font weight and use it as a starting point for the next
        }
      }
    }
  }
})

const container = document.createElement("DIV")
document.body.appendChild(container)

observer.observe(container, { attributes: false, childList: true, subtree: true })

const docSelection = "3598_selection"
const docName = "NL-HaNA_1.04.02_3598_0797"

const adjustOpacity = () => {
  const opcEl = document.getElementById("opc")
  const imageEl = document.getElementById("pagescan")
  opacity = opcEl.value
  wOpacity = `${100 - opacity}%`
  imageEl.style.opacity= opacity
  for (const div of document.getElementsByClassName("textdiv")) {
    div.style.opacity = wOpacity
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const opcEl = document.getElementById("opc")
  const imageEl = document.getElementById("pagescan")
  adjustOpacity()
  opcEl.addEventListener("change", () => {
    adjustOpacity()
  })
  fetch(`.//data/${docSelection}/${docName}.xml`)
    .then(response => response.text())
    .then(data => {
      const xml = parseXml(data)
      const page = xml.children[0].children.filter(x => x["name"] == "Page")[0]
      const {
        attributes: { imageFilename, imageWidth, imageHeight },
      } = page
      const imageStyle = `
        position: absolute;
        left: 0;
        top: 0;
        width: ${scale * imageWidth}px;
        height: ${scale * imageHeight}px;
        border-style: none;
        z-index: -1;
      `
      const bodyStyle = `
        position: absolute;
        left: 0;
        top: 0;
        width: ${scale * imageWidth}px;
        height: ${scale * imageHeight}px;
      `

      const regions = page.children.filter(x => x["name"] == "TextRegion")

      for (const region of regions) {
        const lines = region.children.filter(x => x["name"] == "TextLine")

        for (const line of lines) {
          const words = line.children.filter(x => x["name"] == "Word")
          for (const word of words) {
            const coords = word.children.filter(x => x["name"] == "Coords")[0]
              .attributes["points"]

            const text = word.children
              .filter(x => x["name"] == "TextEquiv")[0]
              .children.filter(x => x["name"] == "Unicode")[0].children[0].text

            renderWord(text, coords, container)
          }
        }
      }
      imageEl.src = `images/${docSelection}/${imageFilename}`
      imageEl.style = imageStyle

      const bodyEl = document.getElementsByTagName("body")[0]
      bodyEl.style = bodyStyle
    })
})

if (DEV) {
  new EventSource("/esbuild").addEventListener("change", () => location.reload())
}
