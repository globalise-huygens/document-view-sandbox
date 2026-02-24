import {Annotation, findSvgPath, findResourceTarget, parseSvgPath} from '@globalise/annotation';
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

type LineNumbersConfig = {
  scale: Scale;
  offset: Offset;
};

export function renderLineNumbers(
  annotations: Record<Id, Annotation>,
  $view: HTMLElement,
  {scale, offset}: LineNumbersConfig,
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

  const $lineNumbers = Object.fromEntries(
    lineAnnos
      .map((line, i) => {
        const id = line.id;
        const words = wordsByLine.get(id);
        if (!words) {
          console.warn('Line without words');
          return;
        }
        const $lineNumber = document.createElement('span');
        $container.appendChild($lineNumber);
        $lineNumber.classList.add('line-number');
        $lineNumber.textContent = `${i + 1}`.padStart(2, '\u00A0');
        const leftMostWord: Rect =
          words.reduce<Rect | null>((prev, curr) => {
            const bbox = calcBoundingBox(
              scale.path(createPoints(parseSvgPath(findSvgPath(curr)))),
            );
            if (!prev) {
              return bbox;
            }
            if (prev.left < bbox.left) {
              return prev;
            }
            return bbox;
          }, null) ?? orThrow('No leftmost word found');

        const blockId = lineToBlock[id];
        if (!blockId) {
          console.warn('Line without block');
          return;
        }
        const corners = blockCorners[blockId] ?? orThrow(`No block ${blockId}`);
        const blockTopLeft = corners[0];

        Object.assign($lineNumber.style, {
          left: px(blockTopLeft[0]),
          top: px(leftMostWord.top + leftMostWord.height / 2),
          marginLeft: px(-scale(100)),
          marginTop: px(-scale(40)),
          fontSize: px(scale(60)),
        });
        $lineNumber.style.display = 'none';
        return [id, $lineNumber];
      })
      .filter((e) => !!e),
  );

  function showLine(lineId: Id) {
    $lineNumbers[lineId].style.display = 'block';
  }

  function hideLine(lineId: Id) {
    $lineNumbers[lineId].style.display = 'none';
  }

  return {showLine, hideLine};
}