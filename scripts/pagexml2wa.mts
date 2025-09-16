import { parseXml } from "@rgrove/parse-xml";
import type { XmlNode, XmlElement } from "@rgrove/parse-xml";
import * as fs from "fs";

const isElement = (n: XmlNode): n is XmlElement => n && n.type === "element";

const childrenElements = (n?: XmlElement) =>
  (n?.children ?? []).filter(isElement) as XmlElement[];

const findFirst = (n: XmlElement | undefined, name: string) =>
  childrenElements(n).find((c) => c.name === name);

const findAll = (n: XmlElement | undefined, name: string) =>
  childrenElements(n).filter((c) => c.name === name);

const getAttr = (n: XmlElement | undefined, key: string) =>
  n?.attributes?.[key];

const pointsToSvgPath = (points?: string) => {
  if (!points) return undefined;

  const trimmed = points.trim().replace(/\s+/g, " ");

  return `<path d="M${trimmed}z"/>`;
};

// e.g. custom="structure {type:page-number;}" -> "page-number"
const getRegionType = (region?: XmlElement): string | undefined => {
  if (!region) return undefined;
  const custom = getAttr(region, "custom");
  if (custom) {
    const structureMatch = custom.match(/structure\s*\{([^}]*)\}/i);
    const inside = structureMatch ? structureMatch[1] : custom;
    const typeMatch = inside.match(/\btype\s*:\s*([^;\s}]+)/i);
    if (typeMatch) return typeMatch[1].trim();
  }
  return undefined;
};

const extractText = (node?: XmlElement): string | undefined => {
  if (!node) return undefined;

  const textEquiv = findFirst(node, "TextEquiv");
  const unicodeEl = findFirst(textEquiv, "Unicode");

  if (unicodeEl?.children?.[0]) {
    const textNode = unicodeEl.children[0] as any;

    if (textNode.type === "text" && textNode.text) {
      return textNode.text.trim() || undefined;
    }
  }
  return undefined;
};

const Annotation = ({
  id,
  granularity,
  canvasId,
  svgPath,
  targets = [],
  bodyText,
  bodyClassification,
}: {
  id: string;
  granularity?: "block" | "line" | "word";
  canvasId?: string;
  svgPath?: string;
  targets?: string[];
  bodyText?: string;
  bodyClassification?: string;
}) => {
  const body: any[] = [];

  if (bodyText) body.push({ type: "TextualBody", value: bodyText });
  if (bodyClassification) {
    const classificationURI = `https://data.globalise.huygens.knaw.nl/hdl:20.500.14722/thesaurus:annotation:${encodeURIComponent(
      bodyClassification
    )}`;

    body.push({
      type: "SpecificResource",
      source: {
        id: classificationURI,
        type: "skos:Concept",
        label: bodyClassification,
      },
      purpose: "classifying",
    });
  }

  const target: any[] = [];
  if (canvasId && svgPath) {
    target.push({
      type: "SpecificResource",
      source: canvasId,
      selector: { type: "SvgSelector", value: svgPath },
    });
  }
  for (const p of targets) target.push({ id: p, type: "Annotation" });

  const anno: any = {
    type: "Annotation",
    id,
    motivation: bodyText ? "supplementing" : "highlighting",
    textGranularity: granularity,
  };

  if (body.length) anno.body = body;
  if (target.length) anno.target = target;

  return anno;
};

export const convertPageXmlToWebAnnotations = (
  xmlString: string,
  canvasId: string
) => {
  const annotations: any[] = [];

  const doc = parseXml(xmlString);

  // Root elements
  const pcGts = childrenElements(doc as any).find((c) => c.name === "PcGts");
  const page = findFirst(pcGts, "Page");
  const pageFilename = getAttr(page, "imageFilename");
  const width = parseInt(getAttr(page, "imageWidth") ?? "0", 10) || undefined;
  const height = parseInt(getAttr(page, "imageHeight") ?? "0", 10) || undefined;

  const baseId = (() => {
    const base = (pageFilename || "page").replace(/\.[a-zA-Z]+$/, "");
    return `https://data.globalise.huygens.knaw.nl/hdl:20.500.14722/annotations:transcriptions:${encodeURIComponent(
      base
    )}`;
  })();

  let blockIdx = 0;
  let lineIdx = 0;
  let wordIdx = 0;

  // Regions
  const pageTextRegions = findAll(page, "TextRegion");

  for (const region of pageTextRegions) {
    blockIdx += 1;

    const regionCoords = findFirst(region, "Coords");
    const regionPoints = getAttr(regionCoords, "points");
    const regionSVG = pointsToSvgPath(regionPoints);
    const regionIdRaw = getAttr(region, "id") || `block${blockIdx}`;
    const blockAnnoId = `${baseId}#${encodeURIComponent(regionIdRaw)}`;

    if (regionSVG) {
      annotations.push(
        Annotation({
          id: blockAnnoId,
          granularity: "block",
          canvasId,
          svgPath: regionSVG,
          bodyClassification: getRegionType(region),
        })
      );
    }

    // Lines
    const lines = findAll(region, "TextLine");
    for (const line of lines) {
      lineIdx += 1;

      const lineCoords = findFirst(line, "Coords");
      const linePoints = getAttr(lineCoords, "points");
      const lineSVG = pointsToSvgPath(linePoints);
      const lineText = extractText(line);
      const lineIdRaw = getAttr(line, "id") || `line${lineIdx}`;
      const lineAnnoId = `${baseId}#${encodeURIComponent(lineIdRaw)}`;

      if (lineSVG || lineText) {
        annotations.push(
          Annotation({
            id: lineAnnoId,
            granularity: "line",
            canvasId,
            svgPath: lineSVG,
            targets: [blockAnnoId],
            bodyText: lineText,
          })
        );
      }

      // Words
      const words = findAll(line, "Word");
      for (const w of words) {
        wordIdx += 1;

        const wCoords = findFirst(w, "Coords");
        const wPoints = getAttr(wCoords, "points");
        const wordSVG = pointsToSvgPath(wPoints);
        const wText = extractText(w);
        const wordIdRaw = getAttr(w, "id") || `word${wordIdx}`;
        const wordAnnoId = `${baseId}#${encodeURIComponent(wordIdRaw)}`;

        if (wordSVG || wText) {
          annotations.push(
            Annotation({
              id: wordAnnoId,
              granularity: "word",
              canvasId,
              svgPath: wordSVG,
              targets: [lineAnnoId],
              bodyText: wText,
            })
          );
        }
      }
    }
  }

  // Minimal AnnotationPage wrapper
  const annotationPage = {
    "@context": [
      "http://iiif.io/api/extension/text-granularity/context.json",
      "http://iiif.io/api/presentation/3/context.json",
    ],
    type: "AnnotationPage",
    id: `https://globalise-huygens.github.io/document-view-sandbox/iiif/annotations/transcriptions/${(
      pageFilename ?? ""
    ).replace(/\.jpg$/i, ".json")}`,
    label: `Transcription of ${pageFilename}`,
    ...(canvasId && width && height
      ? { partOf: { id: canvasId, type: "Canvas", height, width } }
      : {}),
    items: annotations,
  };

  return annotationPage;
};

if (import.meta.main) {
  const [, , inputPath, canvasId, outputPath] = process.argv;

  if (!inputPath || !canvasId || !outputPath) {
    console.error(
      "Usage: node pagexml2wa.mjs <inputPath> <canvasId> <outputPath>"
    );
    process.exit(1);
  }

  if (!fs.existsSync(inputPath)) {
    console.error(`Input file not found: ${inputPath}`);
    process.exit(1);
  }

  const xmlString = fs.readFileSync(inputPath, "utf-8");
  const annotationPage = convertPageXmlToWebAnnotations(xmlString, canvasId);
  fs.writeFileSync(outputPath, JSON.stringify(annotationPage, null, 2));
  console.log(`AnnotationPage written to ${outputPath}`);
}
