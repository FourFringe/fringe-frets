import { describe, it, expect } from 'vitest';
import {
  getScaleTypeNames,
  getCommonScaleTypes,
  getScale,
  getScaleNotes,
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
});
