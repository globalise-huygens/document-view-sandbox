import {TextualBody} from './AnnoModel';

export const isTextualBody = (body: unknown): body is TextualBody =>
  !!body &&
  (body as TextualBody).type === 'TextualBody' &&
  typeof (body as TextualBody).value === 'string';
