import { describe, it, expect } from 'vitest';
import { intervalLabel, buildIntervalMap } from '../../src/services/intervals';

describe('intervals service', () => {
  describe('intervalLabel', () => {
    it('maps 1P to R (root)', () => {
      expect(intervalLabel('1P')).toBe('R');
    });

    it('maps 3M to 3', () => {
      expect(intervalLabel('3M')).toBe('3');
    });

    it('maps 3m to b3', () => {
      expect(intervalLabel('3m')).toBe('b3');
    });

    it('maps 5P to 5', () => {
      expect(intervalLabel('5P')).toBe('5');
    });

    it('maps 7m to b7', () => {
      expect(intervalLabel('7m')).toBe('b7');
    });

    it('maps 7M to 7', () => {
      expect(intervalLabel('7M')).toBe('7');
    });

    it('maps 4A to #4', () => {
      expect(intervalLabel('4A')).toBe('#4');
    });

    it('returns the input for unknown intervals', () => {
      expect(intervalLabel('weird')).toBe('weird');
    });
  });

  describe('buildIntervalMap', () => {
    it('maps C major scale notes to interval labels', () => {
      const notes = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
      const intervals = ['1P', '2M', '3M', '4P', '5P', '6M', '7M'];
      const map = buildIntervalMap(notes, intervals);

      expect(map).toEqual({
        C: 'R',
        D: '2',
        E: '3',
        F: '4',
        G: '5',
        A: '6',
        B: '7',
      });
    });

    it('maps A minor scale notes to interval labels', () => {
      const notes = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
      const intervals = ['1P', '2M', '3m', '4P', '5P', '6m', '7m'];
      const map = buildIntervalMap(notes, intervals);

      expect(map).toEqual({
        A: 'R',
        B: '2',
        C: 'b3',
        D: '4',
        E: '5',
        F: 'b6',
        G: 'b7',
      });
    });

    it('maps a major triad', () => {
      const notes = ['C', 'E', 'G'];
      const intervals = ['1P', '3M', '5P'];
      const map = buildIntervalMap(notes, intervals);

      expect(map).toEqual({ C: 'R', E: '3', G: '5' });
    });

    it('returns empty map for empty input', () => {
      expect(buildIntervalMap([], [])).toEqual({});
    });
  });
});
