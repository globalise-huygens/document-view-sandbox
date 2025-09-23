import {parseXml} from '@rgrove/parse-xml';

import {select} from "d3-selection";
import {polygonHull} from "d3-polygon"
import {line, curveLinearClosed} from "d3-shape"
import { pointsOnPath } from 'points-on-path';

var svgbody = select("body")
    .append("svg")
    .attr("id", "svgbody")
    .attr("width", 4000)
    .attr("height", 5500)
    //.attr("viewbox", "0 0 20 10")



// const ctx = canvas.getContext("2d");
// ctx.fillStyle = "black";
// ctx.font = "23px monospace";


const boundingBox = points => {

    // find the x and y bounds from a set of points

    let max_x = null
    let min_x = null
    let max_y = null
    let min_y = null

    points.forEach(p => {

	const x = parseInt(p[0])
	const y = parseInt(p[1])

	max_x = x > max_x ? x : max_x
	max_y = y > max_y ? y : max_y
	
	min_x = min_x == null || x < min_x ? x : min_x
	min_y = min_y == null || y < min_y ? y : min_y

    })
    
    return {
	"x" : min_x,
	"y": min_y,
	"x2": max_x,
	"y2": max_y,
	"width" : max_x - min_x,
	"height": max_y - min_y
    }    
}


const renderWord = (text, coords, container) => {

    let scale = 1 //0.3
    //document.getElementById("svgbody").style.transform = "scale(0.3)"
    
    const path = "M" + coords + "Z"


    const coordarr = []
    for (const pair of coords.split(" ")){
	coordarr.push(pair.split(","))
    }

    const hull = polygonHull(coordarr)
    const bbox = boundingBox(hull)
    
    let c = document.createElement("DIV")
    container.appendChild(c)
    c.style.position = "absolute"
    c.style.border = "dashed 1px blue"

    c.style.left = (bbox.x * scale) + "px"
    c.style.top = (bbox.y * scale) + "px"
    c.style.width = (bbox.width * scale) + "px"
    c.style.height = (bbox.height * scale) + "px"

    
    c.style.transform= "rotate(0deg)";
   
    let s = document.createElement("DIV")
    //c.appendChild(s)

    s.innerText = text
    s.className= "text"
    //s.style.border = "dashed 1px red"    
    s.style.fontFamily = "monospace"
    
    s.style.display = "block"
    s.style.fontSize = "20px"

    const cur = line().curve(curveLinearClosed)

    svgbody.append("path")
    	.attr("d", cur(hull))
     	.attr("stroke", "black")
    	.attr("fill", "white")
    	.attr("stroke-width", 1)

    
    //ctx.stroke(new Path2D(path))
    //ctx.rect(pathcom.bbox.x, pathcom.bbox.y, pathcom.bbox.width, pathcom.bbox.height)
    //ctx.stroke()
    
    //ctx.fillText(word, pathcom.bbox.x, pathcom.bbox.y + pathcom.bbox.height);		    

}

// https://dev.to/jankapunkt/make-text-fit-it-s-parent-size-using-javascript-m40

//const isOverflown = ({ clientHeight, scrollHeight }) => scrollHeight > clientHeight
const isOverflown = ({ clientWidth, clientHeight, scrollWidth, scrollHeight }) => (scrollWidth > clientWidth)
//const isOverflown = ({ clientWidth, clientHeight, scrollWidth, scrollHeight }) => (scrollWidth > clientWidth) || (scrollHeight > clientHeight)

const resizeText = (el, minSize = 1, maxSize = 150, step = 1, unit = 'px') => {
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

      const verticalAdjust = (parent.clientHeight / 2) -  (el.clientHeight / 2)
      el.style.marginTop = `${verticalAdjust}${unit}`
  }
}

const observer = new MutationObserver((mutationList, observer) => {
    for (const mut of mutationList){
	if (mut.type == "childList"){
	    for (const ad of mut.addedNodes){
		if (ad.className == "text"){
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

fetch('./data/3598_selection/NL-HaNA_1.04.02_3598_0797.xml')
    .then(response => response.text())
    .then((data) => {

	const xml = parseXml(data)

	const regions = xml.children[0]
	      .children.filter( (x => x["name"] == "Page"))[0]
	      .children.filter( (x => x["name"] == "TextRegion"))

	for (const region of regions){
	    const lines = region.children.filter( (x => x["name"] == "TextLine"))
	    
	    for (const line of lines){

		const words = line.children.filter((x => x["name"] == "Word"))
		for (const word of words) {

		    const coords = word.children.filter( (x => x["name"] == "Coords"))[0].attributes["points"]

		    const text = word.children.filter( (x => x["name"] == "TextEquiv"))[0]
			  .children.filter( (x => x["name"] == "Unicode"))[0]
		    	  .children[0].text
		    
		    renderWord(text, coords, container)
		}
		
	    }
	}
    })



if (DEV) {
    new EventSource('/esbuild').addEventListener('change', () => location.reload())
}
