import { TextualBody } from '../AnnoModel';
import { isTextualBody } from './isTextualBody';

export function assertTextualBody(body: unknown): asserts body is TextualBody {
  if (!isTextualBody(body)) {
    throw new Error('Expected TextualBody');
  }
}
