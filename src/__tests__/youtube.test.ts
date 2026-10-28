import { describe, expect, it } from 'vitest';
import { parseTimeParam, parseYouTubeUrl } from '../lib/youtube';

const ID = 'dQw4w9WgXcQ';

describe('parseYouTubeUrl', () => {
  it.each([
    `https://www.youtube.com/watch?v=${ID}`,
    `https://youtube.com/watch?v=${ID}&list=abc`,
    `https://m.youtube.com/watch?v=${ID}`,
    `https://youtu.be/${ID}`,
    `https://www.youtube.com/embed/${ID}`,
    `https://www.youtube.com/live/${ID}?feature=share`,
    `youtube.com/watch?v=${ID}`,
    `  ${ID}  `,
  ])('parses %s', (url) => {
    expect(parseYouTubeUrl(url)).toEqual({ videoId: ID, isShort: false });
  });

  it('flags Shorts', () => {
    expect(parseYouTubeUrl(`https://www.youtube.com/shorts/${ID}`)).toEqual({
      videoId: ID,
      isShort: true,
    });
  });

  it.each([
    [`https://youtube.com/watch?v=${ID}&t=42s`, 42],
    [`https://youtu.be/${ID}?t=42`, 42],
    [`https://www.youtube.com/watch?v=${ID}&t=1m5s`, 65],
  ])('reads t= from %s', (url, t) => {
    expect(parseYouTubeUrl(url)?.startFromUrl).toBe(t);
  });

  it.each([
    '',
    'hello',
    'youtube.com',
    `https://vimeo.com/${ID}`,
    'https://www.youtube.com/watch?v=short',
    'https://www.youtube.com/channel/UC123',
    `https://evil-youtube.com/watch?v=${ID}`,
  ])('rejects %j', (url) => {
    expect(parseYouTubeUrl(url)).toBeNull();
  });
});

describe('parseTimeParam', () => {
  it.each([
    ['42', 42],
    ['42s', 42],
    ['1m5s', 65],
    ['1h2m3s', 3723],
    ['2m', 120],
  ])('%s -> %d', (t, s) => expect(parseTimeParam(t)).toBe(s));

  it.each([null, '', 'abc', '-5'])('%j -> undefined', (t) => {
    expect(parseTimeParam(t)).toBeUndefined();
  });
});
