import { describe, it, expect } from 'vitest';
import {
  getScaleTypeNames,
  getCommonScaleTypes,
  getScale,
  getScaleNotes,
  formatScaleNotes,
} from '../../src/services/scales';

describe('scales service', () => {
  describe('getScaleTypeNames', () => {
    it('returns an array of scale type names', () => {
      const names = getScaleTypeNames();
      expect(names.length).toBeGreaterThan(0);
      expect(names).toContain('major');
      expect(names).toContain('minor');
    });
  });

  describe('getCommonScaleTypes', () => {
    it('returns categorized scale types', () => {
      const common = getCommonScaleTypes();
      expect(common).toHaveProperty('Major / Minor');
      expect(common).toHaveProperty('Modes');
      expect(common).toHaveProperty('Pentatonic');
      expect(common['Major / Minor']).toContain('major');
      expect(common['Major / Minor']).toContain('minor');
    });
  });

  describe('getScale', () => {
    it('returns scale info for a valid scale', () => {
      const scale = getScale('C', 'major');
      expect(scale).toBeTruthy();
      expect(scale?.name).toBe('C major');
      expect(scale?.notes).toEqual(['C', 'D', 'E', 'F', 'G', 'A', 'B']);
    });

    it('returns null for an invalid scale', () => {
      const scale = getScale('C', 'nonexistent-scale-xyz');
      expect(scale).toBeNull();
    });
  });

  describe('getScaleNotes', () => {
    it('returns note names for a scale', () => {
      const notes = getScaleNotes('A', 'minor');
      expect(notes).toEqual(['A', 'B', 'C', 'D', 'E', 'F', 'G']);
    });

    it('returns empty array for invalid scale', () => {
      const notes = getScaleNotes('C', 'nonexistent-xyz');
      expect(notes).toEqual([]);
    });
  });

  describe('formatScaleNotes', () => {
    it('formats C major with correct whole/half step separators and octave close', () => {
      // C major: W W H W W W H
      const { notes, intervals } = getScale('C', 'major')!;
      expect(formatScaleNotes(notes, intervals)).toBe('C - D - E F - G - A - B C');
    });

    it('formats A natural minor with correct separators', () => {
      // A minor: W H W W H W W
      const { notes, intervals } = getScale('A', 'minor')!;
      expect(formatScaleNotes(notes, intervals)).toBe('A - B C - D - E F - G - A');
    });

    it('formats B Lydian with the raised 4th', () => {
      // Lydian: W W W H W W H
      const { notes, intervals } = getScale('B', 'lydian')!;
      expect(formatScaleNotes(notes, intervals)).toBe('B - C# - D# - E# F# - G# - A# B');
    });

    it('formats A minor pentatonic (all whole+minor-third steps)', () => {
      // Am pentatonic: m3 W W m3 W  — no half steps, so all separators are " - "
      const { notes, intervals } = getScale('A', 'minor pentatonic')!;
      expect(formatScaleNotes(notes, intervals)).toBe('A - C - D - E - G - A');
    });

    it('returns empty string for empty input', () => {
      expect(formatScaleNotes([], [])).toBe('');
    });

    it('always ends with the root note (octave closure)', () => {
      const { notes, intervals } = getScale('G', 'dorian')!;
      const formatted = formatScaleNotes(notes, intervals);
      expect(formatted.endsWith('G')).toBe(true);
      // First and last character groups should both be 'G'
      const parts = formatted.split(/[ \-]+/).filter(Boolean);
      expect(parts[0]).toBe('G');
      expect(parts[parts.length - 1]).toBe('G');
    });
  });
});
