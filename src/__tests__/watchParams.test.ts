import { describe, expect, it } from 'vitest';
import { buildShareLink, parseWatchParams } from '../lib/watchParams';

const ID = 'dQw4w9WgXcQ';
const parse = (q: string) => parseWatchParams(new URLSearchParams(q));

describe('parseWatchParams', () => {
  it('parses a full clip', () => {
    expect(parse(`v=${ID}&start=30&end=75&ar=v`)).toEqual({
      videoId: ID,
      start: 30,
      end: 75,
      vertical: true,
    });
  });

  it('defaults to untrimmed 16:9', () => {
    expect(parse(`v=${ID}`)).toEqual({ videoId: ID, start: 0, end: undefined, vertical: false });
  });

  it.each([
    '',
    'v=',
    'v=short',
    `v=${ID}&start=-5`,
    `v=${ID}&start=abc`,
    `v=${ID}&start=1.5`,
    `v=${ID}&end=abc`,
    `v=${ID}&start=30&end=30`,
    `v=${ID}&start=30&end=10`,
  ])('rejects %j', (q) => expect(parse(q)).toBeNull());
});

describe('buildShareLink', () => {
  const base = 'https://example.com/app/';

  it('round-trips through parseWatchParams', () => {
    const p = { videoId: ID, start: 30, end: 75, vertical: true };
    const link = buildShareLink(p, base);
    expect(link).toBe(`${base}#/watch?v=${ID}&start=30&end=75&ar=v`);
    expect(parseWatchParams(new URLSearchParams(link.split('?')[1]))).toEqual(p);
  });

  it('omits defaults', () => {
    expect(buildShareLink({ videoId: ID, start: 0, vertical: false }, base)).toBe(
      `${base}#/watch?v=${ID}`,
    );
  });
});
