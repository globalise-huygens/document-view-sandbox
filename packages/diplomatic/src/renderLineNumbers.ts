import {Annotation, findSvgPath, findResourceTarget, parseSvgPath} from '@globalise/common/annotation';
import {Id} from '@knaw-huc/original-layout';
import {Point} from '@knaw-huc/original-layout';
import {Rect} from '@knaw-huc/original-layout';
import {
  calcBoundingBox,
  calcBoundingCorners,
  padCorners,
} from '@knaw-huc/original-layout';
import {createPoints} from '@knaw-huc/original-layout';
import {orThrow} from '@knaw-huc/original-layout';
import {px} from '@knaw-huc/original-layout';
import {Scale} from '@knaw-huc/original-layout';
import {createBlockBoundaries} from './createBlockBoundaries.ts';
import {Offset} from '@knaw-huc/original-layout';

export type LineNumbersConfig = {
  scale: Scale;
  offset: Offset;
  gap: number;
};

export function renderLineNumbers(
  annotations: Record<Id, Annotation>,
  $view: HTMLElement,
  {scale, offset, gap}: LineNumbersConfig,
) {
  const $container = document.createElement('div');
  $view.appendChild($container);
  $container.classList.add('line-numbers');
  $container.style.top = px(offset.top);
  $container.style.left = px(offset.left);

  const lineAnnos = Object.values(annotations).filter(
    (a) => a.textGranularity === 'line',
  );
  const wordAnnos = Object.values(annotations).filter(
    (a) => a.textGranularity === 'word',
  );

  const wordsByLine: Map<Id, Annotation[]> = new Map();
  for (const wordAnno of wordAnnos) {
    const target = findResourceTarget(wordAnno);
    if (!wordsByLine.has(target.id)) {
      wordsByLine.set(target.id, []);
    }
    wordsByLine.get(target.id)!.push(wordAnno);
  }
  const lineToBlock: Record<Id, Id> = {};
  for (const line of lineAnnos) {
    const block = findResourceTarget(line);
    lineToBlock[line.id] = block.id;
  }

  const padding: Point = [50, 100];
  const blockBoundaries = createBlockBoundaries(wordAnnos, annotations);
  const blockCorners = Object.fromEntries(
    Object.entries(blockBoundaries).map(([id, block]) => {
      const corners = calcBoundingCorners(block);
      const padded = scale.path(padCorners(corners, padding));
      return [id, padded];
    }),
  );

  const $lineNumbers: Record<Id, HTMLSpanElement> = {};

  for (const [i, line] of lineAnnos.entries()) {
    const words = wordsByLine.get(line.id);
    if (!words) {
      console.debug('Line without words:', line.id);
      continue;
    }

    const blockId = lineToBlock[line.id];
    if (!blockId) {
      console.debug('Line without block:', line.id);
      continue;
    }

    const corners = blockCorners[blockId] ?? orThrow(`No block ${blockId}`);
    const blockTopLeft = corners[0];
    const leftMostWord = findLeftMostWord(words, scale);

    const $lineNumber = document.createElement('span');
    $container.appendChild($lineNumber);
    $lineNumber.classList.add('line-number');
    $lineNumber.textContent = `${i + 1}`;
    $lineNumber.style.display = 'none';
    Object.assign($lineNumber.style, {
      left: px(blockTopLeft[0] - gap),
      top: px(leftMostWord.top + leftMostWord.height / 2),
      transform: 'translateX(-100%)',
      marginTop: px(-scale(40)),
      fontSize: px(scale(50)),
    });

    $lineNumbers[line.id] = $lineNumber;
  }

  function showLine(lineId: Id) {
    const $lineNumber = $lineNumbers[lineId];
    if ($lineNumber) {
      $lineNumber.style.display = 'block';
    }
  }

  function hideLine(lineId: Id) {
    const $lineNumber = $lineNumbers[lineId];
    if ($lineNumber) {
      $lineNumber.style.display = 'none';
    }
  }

  return {showLine, hideLine};
}

function findLeftMostWord(
  words: Annotation[],
  scale: Scale
): Rect {
  let leftMost: Rect | null = null;
  for (const word of words) {
    const bbox = calcBoundingBox(
      scale.path(createPoints(parseSvgPath(findSvgPath(word)))),
    );
    if (!leftMost || bbox.left < leftMost.left) {
      leftMost = bbox;
    }
  }
  return leftMost ?? orThrow('No leftmost word found');
}