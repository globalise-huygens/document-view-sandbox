const getImageUrl = (canvas: any, size = "full") => {
  const imageId = canvas.items[0].items[0].body.id;
  if (size === "thumb") {
    return imageId.replace(
      "full/full/0/default.jpg",
      "full/,150/0/default.jpg"
    );
  }
  return imageId.replace("full/full/0/default.jpg", "info.json");
};

const getAnnotationLabel = (ann: any): string => {
  const bodies = Array.isArray(ann?.body) ? ann.body : [ann?.body];

  const text = bodies.find(
    (b: any) => b?.type === "TextualBody" && b?.value
  )?.value;

  if (text) return String(text);

  const concept = bodies.find((b: any) => b?.source?.label);
  const label = concept?.source?.label || concept?.source?.id;

  if (typeof label === "string") return label;

  if (label?.en?.[0]) return label.en[0];

  if (label?.none?.[0]) return label.none[0];

  return ann?.motivation || "Annotation";
};

const getCanvasLabel = (canvas: any) => {
  return canvas?.label?.en?.[0] || canvas?.label?.none?.[0] || "Untitled";
};

export { getImageUrl, getCanvasLabel, getAnnotationLabel };
