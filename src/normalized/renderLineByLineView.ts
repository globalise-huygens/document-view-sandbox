import {Annotation} from '../diplomatic/AnnoModel';
import {renderNormalizedLayout} from './renderNormalizedLayout';
import {orThrow} from '../util/orThrow';
import {renderBlocks} from './renderBlocks';
import {Id} from '../diplomatic/Id';
import {View} from '../diplomatic/View';
import {findResourceTarget} from '../diplomatic/findResourceTarget';

type LineByLineViewProps = {
  $view: HTMLElement;
  annotations: Record<Id, Annotation>;
};

export function renderLineByLineView(
  {$view, annotations}: LineByLineViewProps
): View {
  function show() {
    $view.style.visibility = 'visible';
  }

  function hide() {
    $view.style.visibility = 'hidden';
  }

  const layout = renderNormalizedLayout($view, annotations);
  const {$ranges, $lines, ranges, $overlay} = layout;

  const annotationToRanges: Record<Id, HTMLElement[]> = {};
  for (const range of ranges) {
    const $range = $ranges[range.id];
    if (!$range) continue;
    for (const annoId of range.annotations) {
      if (!annotationToRanges[annoId]) {
        annotationToRanges[annoId] = [];
      }
      annotationToRanges[annoId].push($range);
    }
  }

  const selectedRegions = new Set<Id>();

  const blockConfig = {stroke: 'rgba(0,150,0,0.5)'};
  const {$blocks} = renderBlocks($lines, $overlay, annotations, blockConfig);

  for (const [lineId, $line] of Object.entries($lines)) {
    const line = annotations[lineId];
    const blockId = findResourceTarget(line).id;
    const $block = $blocks[blockId];
    $line.addEventListener('mouseenter', () => {
      if (selectedRegions.has(blockId)) {
        return;
      }
      $block.attr('opacity', 1);
    });
    $line.addEventListener('mouseleave', () => {
      if (selectedRegions.has(blockId)) {
        return;
      }
      $block.attr('opacity', 0);
    });
  }

  function selectRegion(id: Id) {
    const $block = $blocks[id];
    if (!$block) {
      return;
    }
    if (selectedRegions.has(id)) {
      return;
    }
    selectedRegions.add(id);
    $block.attr('opacity', 1);
  }

  function deselectRegion(id: Id) {
    const $block = $blocks[id];
    if (!$block) {
      return;
    }
    if (!selectedRegions.has(id)) {
      return;
    }
    selectedRegions.delete(id);
    $block.attr('opacity', 0);
  }

  function selectAnnotation(id: Id) {
    const annotation = annotations[id] ?? orThrow('Not found');
    if (annotation.textGranularity === 'word') {
      const spans = annotationToRanges[id] ?? [];
      spans.forEach(($r) => $r.classList.add('selected'));
    } else if (annotation.textGranularity === 'block') {
      selectRegion(id);
    } else {
      console.warn(`Select not implemented: ${annotation.textGranularity}`);
    }
  }

  function deselectAnnotation(id: Id) {
    const annotation = annotations[id] ?? orThrow('Not found');
    if (annotation.textGranularity === 'word') {
      const spans = annotationToRanges[id] ?? [];
      spans.forEach(($r) => $r.classList.remove('selected'));
    } else if (annotation.textGranularity === 'block') {
      deselectRegion(id);
    } else {
      console.warn(`Deselect not implemented: ${annotation.textGranularity}`);
    }
  }

  return {
    selectAnnotation,
    deselectAnnotation,
    hide,
    show,
  };
}