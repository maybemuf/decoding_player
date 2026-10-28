import { describe, expect, it } from 'vitest';
import { formatTime, parseTime } from '../lib/time';

describe('parseTime', () => {
  it.each([
    ['75', 75],
    ['1:15', 75],
    ['01:15', 75],
    ['0:00', 0],
    ['1:02:03', 3723],
    [' 1:15 ', 75],
  ])('%j -> %d', (s, n) => expect(parseTime(s)).toBe(n));

  it.each(['', 'abc', '1:5', '1:60', '-5', '1.5', '1:02:03:04', ':30'])('%j -> null', (s) => {
    expect(parseTime(s)).toBeNull();
  });
});

describe('formatTime', () => {
  it.each([
    [0, '0:00'],
    [65, '1:05'],
    [3723, '1:02:03'],
    [75.9, '1:15'],
    [-3, '0:00'],
  ])('%d -> %s', (n, s) => expect(formatTime(n)).toBe(s));

  it('round-trips', () => {
    for (const n of [0, 9, 59, 60, 61, 599, 3599, 3600, 7322]) {
      expect(parseTime(formatTime(n))).toBe(n);
    }
  });
});
