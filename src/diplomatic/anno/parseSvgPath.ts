/**
 * Format: `<path d="M247,1799 297,1798 346,1795 376,1794z"/>`
 */
export function parseSvgPath(svgPath: string): string {
  const dMatch = svgPath.match(/d="([^"]+)"/);
  if (!dMatch) {
    throw new Error("Could not extract d attribute from svg path");
  }
  const pathData = dMatch[1];
  let points = pathData.trim();
  if (points.startsWith("M")) {
    points = points.substring(1).trim();
  }
  if (points.endsWith("z")) {
    points = points.substring(0, points.length - 1).trim();
  }
  return points;
}
