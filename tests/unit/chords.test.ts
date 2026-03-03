import { describe, it, expect } from 'vitest';
import {
  getChordTypeNames,
  getCommonChordTypes,
  getChord,
  getChordNotes,
} from '../../src/services/chords';

describe('chords service', () => {
  describe('getChordTypeNames', () => {
    it('returns an array of chord type names', () => {
      const names = getChordTypeNames();
      expect(names.length).toBeGreaterThan(0);
      expect(names).toContain('major');
      expect(names).toContain('minor');
    });
  });

  describe('getCommonChordTypes', () => {
    it('returns categorized chord types', () => {
      const common = getCommonChordTypes();
      expect(common).toHaveProperty('Triads');
      expect(common).toHaveProperty('Sevenths');
      expect(common['Triads']).toContain('major');
      expect(common['Triads']).toContain('minor');
    });
  });

  describe('getChord', () => {
    it('returns chord info for a valid chord', () => {
      const chord = getChord('C', 'major');
      expect(chord).toBeTruthy();
      expect(chord?.notes).toContain('C');
      expect(chord?.notes).toContain('E');
      expect(chord?.notes).toContain('G');
    });

    it('returns null for an unknown chord type', () => {
      const chord = getChord('C', 'nonexistent-xyz');
      expect(chord).toBeNull();
    });
  });

  describe('getChordNotes', () => {
    it('returns note names for a chord', () => {
      const notes = getChordNotes('A', 'minor');
      expect(notes).toContain('A');
      expect(notes).toContain('C');
      expect(notes).toContain('E');
    });

    it('returns empty array for invalid chord', () => {
      const notes = getChordNotes('C', 'nonexistent-xyz');
      expect(notes).toEqual([]);
    });
  });
});
