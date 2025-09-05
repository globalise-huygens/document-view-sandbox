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

const getCanvasLabel = (canvas: any) => {
  return canvas?.label?.en?.[0] || canvas?.label?.none?.[0] || "Untitled";
};

export { getImageUrl, getCanvasLabel };
