import { describe, it, expect } from 'vitest';
import { simplifyNote, isSameNote, enharmonicDisplayLabel } from '../../src/services/notes';

describe('notes service', () => {
  describe('simplifyNote', () => {
    it('returns natural notes unchanged', () => {
      expect(simplifyNote('C')).toBe('C');
      expect(simplifyNote('F')).toBe('F');
    });

    it('simplifies single sharps to enharmonic naturals where applicable', () => {
      expect(simplifyNote('E#')).toBe('F');
      expect(simplifyNote('B#')).toBe('C');
    });

    it('simplifies double sharps', () => {
      expect(simplifyNote('C##')).toBe('D');
      expect(simplifyNote('F##')).toBe('G');
    });

    it('returns the note unchanged when already simple', () => {
      expect(simplifyNote('C#')).toBe('C#'); // or 'Db' — tonal picks C# here
      expect(simplifyNote('Bb')).toBe('Bb');
    });
  });

  describe('isSameNote', () => {
    it('returns true for identical notes', () => {
      expect(isSameNote('C', 'C')).toBe(true);
      expect(isSameNote('F#', 'F#')).toBe(true);
    });

    it('returns true for enharmonic equivalents', () => {
      expect(isSameNote('E#', 'F')).toBe(true);
      expect(isSameNote('B#', 'C')).toBe(true);
      expect(isSameNote('C#', 'Db')).toBe(true);
      expect(isSameNote('Bb', 'A#')).toBe(true);
    });

    it('returns false for different notes', () => {
      expect(isSameNote('C', 'D')).toBe(false);
      expect(isSameNote('E', 'F')).toBe(false);
      expect(isSameNote('C#', 'D')).toBe(false);
    });
  });

  describe('enharmonicDisplayLabel', () => {
    it('returns null for natural notes', () => {
      expect(enharmonicDisplayLabel('C')).toBeNull();
      expect(enharmonicDisplayLabel('D')).toBeNull();
      expect(enharmonicDisplayLabel('E')).toBeNull();
      expect(enharmonicDisplayLabel('F')).toBeNull();
      expect(enharmonicDisplayLabel('G')).toBeNull();
      expect(enharmonicDisplayLabel('A')).toBeNull();
      expect(enharmonicDisplayLabel('B')).toBeNull();
    });

    it('returns ♯/♭ label for sharp-spellings', () => {
      expect(enharmonicDisplayLabel('C#')).toBe('C♯/D♭');
      expect(enharmonicDisplayLabel('F#')).toBe('F♯/G♭');
      expect(enharmonicDisplayLabel('A#')).toBe('A♯/B♭');
    });

    it('returns the same ♯/♭ label for flat-spellings', () => {
      expect(enharmonicDisplayLabel('Db')).toBe('C♯/D♭');
      expect(enharmonicDisplayLabel('Gb')).toBe('F♯/G♭');
      expect(enharmonicDisplayLabel('Bb')).toBe('A♯/B♭');
    });

    it('handles all five black-key pitch classes', () => {
      const accidentals = ['C#', 'D#', 'F#', 'G#', 'A#'];
      accidentals.forEach((pc) => {
        expect(enharmonicDisplayLabel(pc)).not.toBeNull();
        expect(enharmonicDisplayLabel(pc)).toContain('♯');
        expect(enharmonicDisplayLabel(pc)).toContain('♭');
      });
    });
  });
});
