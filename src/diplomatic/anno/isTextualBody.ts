import { TextualBody } from "../AnnoModel";

export const isTextualBody = (body: any): body is TextualBody =>
  body && body.type === "TextualBody" && typeof body.value === "string";
