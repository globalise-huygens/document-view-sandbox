import {Annotation} from "./AnnoModel";
import {Id} from "./Id";
import {Point} from "./Point";
import {Rect} from "./Rect";
import {calcBoundingBox} from "./calcBoundingBox";
import {createPoints} from "./createPoints";
import {findSvgPath} from "./anno/findSvgPath";
import {orThrow} from "../util/orThrow";
import {px} from "./px";

export function renderLineNumbers(
  lines: Annotation[],
  $text: HTMLDivElement,
  wordAnnosByLine: Map<Id, Annotation[]>,
  scalePoint: (p: Point) => Point,
  lineToBlock: Record<string, string>,
  blockCorners: {
    [p: string]: [number, number][]
  },
  scale: (toScale: number) => number
) {
  return Object.fromEntries(
    lines
      .map((line, i) => {
        const id = line.id;
        const $lineNumber = document.createElement('span');
        $text.appendChild($lineNumber);
        $lineNumber.classList.add('line-number');
        $lineNumber.textContent = `${i + 1}`.padStart(2, '0');
        const words = wordAnnosByLine.get(id);
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