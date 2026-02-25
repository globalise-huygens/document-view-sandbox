import {renderNormalizedLayout} from './renderNormalizedLayout';
import {renderBlocks} from './renderBlocks';
import {
  Annotation,
  findResourceTarget, orThrow
} from '@globalise/annotation';
import {Id, View} from '@knaw-huc/original-layout';

type LineByLineViewProps = {
  $view: HTMLElement;
  annotations: Record<Id, Annotation>;
  onHover?: (id: Id | null) => void;
  onClick?: (id: Id) => void;
};

export function renderLineByLineView(
  {$view, annotations, onHover, onClick}: LineByLineViewProps
): View {
  function show() {
    $view.style.visibility = 'visible';
  }

  function hide() {
    $view.style.visibility = 'hidden';
  }

  const layout = renderNormalizedLayout($view, annotations, {onHover, onClick});
  const {$ranges, $lines, ranges, $overlay} = layout;

  const linesToBlock: Record<Id, Id> = {};
  for (const anno of Object.values(annotations)) {
    if (anno.textGranularity === 'line') {
      linesToBlock[anno.id] = findResourceTarget(anno).id;
    }
  }
  const lineIds = Object.keys($lines);
  for (let i = 0; i < lineIds.length - 1; i++) {
    const currentId = lineIds[i];
    const nextId = lineIds[i + 1];
    if (linesToBlock[currentId] !== linesToBlock[nextId]) {
      $lines[currentId].classList.add('region-end');
    }
  }

  const annotationToRanges: Record<Id, HTMLElement[]> = {};
  for (const range of ranges) {
    const $range = $ranges[range.id];
    if (!$range) {
      continue;
    }
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
      const ranges = annotationToRanges[id] ?? [];
      ranges.forEach(($r) => $r.classList.add('selected'));
    } else if (annotation.textGranularity === 'block') {
      selectRegion(id);
    } else {
      console.warn(`Select not implemented: ${annotation.textGranularity}`);
    }
  }

  function deselectAnnotation(id: Id) {
    const annotation = annotations[id] ?? orThrow('Not found');
    if (annotation.textGranularity === 'word') {
      const ranges = annotationToRanges[id] ?? [];
      ranges.forEach(($r) => $r.classList.remove('selected'));
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