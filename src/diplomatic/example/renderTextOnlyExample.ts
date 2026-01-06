import {IiifAnnotationPage} from "../AnnoModel";
import {px} from "../px";
import {renderDiplomaticView} from "../renderDiplomaticView";
import {$} from "./$";

export async function renderTextOnlyExample(
  $parent: HTMLElement
) {

  const jsonPath = '../iiif/annotations/transcriptions/NL-HaNA_1.04.02_3598_0797.json';
  // const jsonPath = "../data/3965_selection/NL-HaNA_1.04.02_3965_0177.json";
  // const jsonPath = '../iiif/annotations/transcriptions/NL-HaNA_1.04.02_3598_0799.json';
  // const jsonPath = '../iiif/annotations/transcriptions/NL-HaNA_1.04.02_3598_1007.json';
  // const jsonPath = '../iiif/annotations/transcriptions/NL-HaNA_1.04.02_3598_1012.json';

  $parent.classList.add('text-only')
  $parent.innerHTML = `<div class="diplomatic-view"></div>`
  const $menu = $('#menu')
  const $view: HTMLDivElement = $('.diplomatic-view', $parent);
  const $slider = document.createElement('span')
  $menu.appendChild($slider)
  $slider.classList.add('slider')
  $slider.innerHTML = `
    zoom: min 
    <input type="range" value="100" min="50" max="200"/> 
    max`
  const $input: HTMLInputElement = $('input', $slider)

  const annoResponse = await fetch(jsonPath);
  const annoPage: IiifAnnotationPage = await annoResponse.json();

  const {width: parentWidth} = $parent.getBoundingClientRect();
  const {width, height} = annoPage.partOf;

  let sliderScale = -1
  const adjustScale = () => {
    sliderScale = parseInt($input.value) / 100;
    const scale = Math.max(parentWidth / +width) * sliderScale;
    $view.style.height = px(0);
    $view.style.width = px(scale * width);

    const viewConfig = {showBoundaries: true, showScanMargin: false};
    renderDiplomaticView($view, annoPage, viewConfig);
    console.log('scale', sliderScale)
  }

  $slider.addEventListener('change', adjustScale);
  adjustScale();
}