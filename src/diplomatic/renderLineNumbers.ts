import {Annotation, AnnotationPage} from "./AnnoModel";
import {Id} from "./Id";
import {Point} from "./Point";
import {Rect} from "./Rect";
import {
  calcBoundingBox,
  calcBoundingCorners,
  padCorners
} from "./calcBoundingBox";
import {createPoints} from "./createPoints";
import {findSvgPath} from "./anno/findSvgPath";
import {orThrow} from "../util/orThrow";
import {px} from "./px";
import {findResourceTarget} from "./findResourceTarget";
import {createBlockBoundaries} from "./createBlockBoundaries";

export function renderLineNumbers(
  annotations: Record<Id, Annotation>,
  $text: HTMLDivElement,
  config: {
    factor: number
  }
): Record<Id, HTMLElement> {
  const {factor} = config;
  const lineAnnos = Object.values(annotations).filter((a) => a.textGranularity === 'line');
  const wordAnnos = Object.values(annotations).filter((a) => a.textGranularity === 'word');

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

  const scale = (toScale: number) => toScale * factor;
  const scalePoint = (p: Point): Point => [scale(p[0]), scale(p[1])];

  const padding: Point = [50, 100];
  const blockBoundaries = createBlockBoundaries(wordAnnos, annotations);
  const blockCorners = Object.fromEntries(
    Object.entries(blockBoundaries).map(([id, block]) => {
      const corners = calcBoundingCorners(block);
      const padded = padCorners(corners, padding);
      const scaled = padded.map(scalePoint);
      return [id, scaled];
    }),
  );
  return Object.fromEntries(
    lineAnnos
      .map((line, i) => {
        const id = line.id;
        const $lineNumber = document.createElement('span');
        $text.appendChild($lineNumber);
        $lineNumber.classList.add('line-number');
        $lineNumber.textContent = `${i + 1}`.padStart(2, '0');
        const words = wordsByLine.get(id);
        if (!words) {
          console.warn('Line without words');
          return;
        }
        const leftMostWord: Rect =
          words.reduce<Rect | null>((prev, curr) => {
            const bbox = calcBoundingBox(
              createPoints(findSvgPath(curr)).map(scalePoint),
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
          marginLeft: px(-scale(120)),
          marginTop: px(-scale(40)),
          fontSize: px(scale(80)),
        });
        $lineNumber.style.display = 'none';
        return [id, $lineNumber];
      })
      .filter((e) => !!e),
  );
}