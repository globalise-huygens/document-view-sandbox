import {renderNormalizedLayout} from './renderNormalizedLayout';
import {renderBlocks} from './renderBlocks';
import {Annotation, findResourceTarget, orThrow} from '@globalise/common/annotation';
import {buildAnnotationHierarchy} from '@globalise/common/annotation';
import {Id} from '@knaw-huc/original-layout';
import {View} from './View.ts';

type LineByLineViewProps = {
  $view: HTMLElement;
  annotations: Record<Id, Annotation>;
  onHover?: (id: Id | null) => void;
  onClick?: (id: Id) => void;
};
const noop = () => {};
export function renderLineByLineView(
  {$view, annotations, onHover = noop, onClick = noop}: LineByLineViewProps
): View {
  const layout = renderNormalizedLayout($view, annotations, {onHover, onClick});
  const {$ranges, $lines, ranges, $overlay} = layout;

  const {linesToBlock} = buildAnnotationHierarchy(annotations);

  const lineIds = Object.keys($lines);
  for (let i = 0; i < lineIds.length - 1; i++) {
    const currentId = lineIds[i];
    const nextId = lineIds[i + 1];
    if (linesToBlock[currentId] !== linesToBlock[nextId]) {
      $lines[currentId].classList.add('block-end');
    }
  }

  const annotationToRanges: Record<Id, HTMLElement[]> = {};
  for (const range of ranges) {
    const $range = $ranges[range.id];
    if (!$range) {
      continue;
    }
    for (const annotation of range.annotations) {
      if (!annotationToRanges[annotation.id]) {
        annotationToRanges[annotation.id] = [];
      }
      annotationToRanges[annotation.id].push($range);
    }
  }

  const selectedBlocks = new Set<Id>();

  const blockConfig = {stroke: 'rgba(0,150,0,0.5)'};
  const {$blocks} = renderBlocks($lines, $overlay, annotations, blockConfig);

  for (const [lineId, $line] of Object.entries($lines)) {
    const line = annotations[lineId];
    const blockId = findResourceTarget(line).id;
    $line.addEventListener('mouseenter', () => {
      onHover(blockId);
    });
    $line.addEventListener('mouseleave', () => {
      onHover(null);
    });
  }

  function selectBlock(id: Id) {
    const $block = $blocks[id];
    if (!$block) {
      return;
    }
    if (selectedBlocks.has(id)) {
      return;
    }
    selectedBlocks.add(id);
    $block.attr('opacity', 1);
  }

  function deselectBlock(id: Id) {
    const $block = $blocks[id];
    if (!$block) {
      return;
    }
    if (!selectedBlocks.has(id)) {
      return;
    }
    selectedBlocks.delete(id);
    $block.attr('opacity', 0);
  }

  function selectAnnotation(id: Id) {
    const annotation = annotations[id] ?? orThrow('Not found');
    if (annotation.textGranularity === 'word') {
      const ranges = annotationToRanges[id] ?? [];
      ranges.forEach(($r) => $r.classList.add('selected'));
    } else if (annotation.textGranularity === 'block') {
      selectBlock(id);
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
      deselectBlock(id);
    } else {
      console.warn(`Deselect not implemented: ${annotation.textGranularity}`);
    }
  }

  const selectedIds: Id[] = [];

  return {
    setSelected: (...ids: string[]) => {
      const selected = ids.filter(id => !selectedIds.includes(id));
      const deselected = selectedIds.filter(id => !ids.includes(id));

      selected.forEach(id => selectAnnotation(id));
      deselected.forEach(id => deselectAnnotation(id));

      selectedIds.length = 0;
      selectedIds.push(...ids);
    }
  };
}