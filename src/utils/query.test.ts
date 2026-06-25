import { describe, expect, it } from 'vitest';

import { serialiseQuery } from './query';

describe('serialiseQuery', () => {
  it('strips null and undefined values', () => {
    expect(serialiseQuery({ a: 'x', b: undefined, c: null, d: 1, e: true })).toEqual({
      a: 'x',
      d: 1,
      e: true,
    });
  });

  it('returns empty object for empty input', () => {
    expect(serialiseQuery({})).toEqual({});
  });
});
