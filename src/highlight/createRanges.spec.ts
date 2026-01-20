import {describe, it, expect} from 'vitest';
import {createRanges} from './createRanges';
import {Offsets} from './Model';

describe('createRanges', () => {

  it('creates one empty range when no annotations', () => {
    const text = 'a';
    const annotations: Offsets[] = [];
    const ranges = createRanges(text, annotations);
    expect([...ranges.values()]).toEqual([
      {id: '0', begin: 0, end: 1, annotations: []},
    ]);
  });

  it('creates one range when one annotation', () => {
    const text = 'a';
    const annotations: Offsets[] = [
      {begin: 0, end: 1, body: {id: 'a'}},
    ];
    const ranges = createRanges(text, annotations);
    expect([...ranges.values()]).toEqual([
      {id: '0', begin: 0, end: 1, annotations: ["a"]},
    ]);
  });

  it('creates three ranges with one annotation linked to middle char', () => {
    const text = 'abc';
    const annotations: Offsets[] = [
      {begin: 1, end: 2, body: {id: 'b'}},
    ];

    const ranges = createRanges(text, annotations);

    expect([...ranges.values()]).toEqual([
      {id: '0', begin: 0, end: 1, annotations: []},
      {id: '1', begin: 1, end: 2, annotations: ['b']},
      {id: '2', begin: 2, end: 3, annotations: []},
    ]);
  });

});