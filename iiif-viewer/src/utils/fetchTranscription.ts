import type { AnnotationPage } from "@iiif/presentation-3";

export async function fetchTranscription(annoPage: AnnotationPage | null) {
  if (!annoPage) return;
  const text: string[] | undefined = annoPage.items
    ?.filter((ap) => ap.motivation === "supplementing")
    .map((anno) => {
      const textualBody = anno.body?.find(
        (body) => body.type === "TextualBody"
      );
      if (!textualBody) return;

      if (anno.textGranularity === "line") {
        return textualBody.value;
      }
    })
    .filter(Boolean);

  return text;
}
