import { describe, it, expect } from 'vitest';
import { createRanges } from './createRanges';
import { Annotation } from './Model';

describe('createRanges', () => {
  it('creates three ranges with one annotation linked to middle char', () => {
    const text = 'abc';
    const annotations: Annotation[] = [
      { begin: 1, end: 2, body: { id: 'b', type: 'person' } },
    ];

    const ranges = createRanges(text, annotations);

    expect([...ranges.values()]).toEqual([
      { id: '0', begin: 0, end: 1, annotations: [] },
      { id: '1', begin: 1, end: 2, annotations: ['b'] },
      { id: '2', begin: 2, end: 3, annotations: [] },
    ]);
  });
});