import { describe, it, expect } from 'vitest';
import { getNoteAtPosition, buildFretboard, filterByPitchClasses } from '../../src/services/fretboard';

describe('fretboard service', () => {
  describe('getNoteAtPosition', () => {
    it('returns correct note at fret 0 (open string)', () => {
      const pos = getNoteAtPosition('E4', 0);
      expect(pos.note).toBe('E');
      expect(pos.fret).toBe(0);
      expect(pos.midi).toBe(64);
    });

    it('returns correct note one semitone up', () => {
      const pos = getNoteAtPosition('E4', 1);
      expect(pos.note).toBe('F');
      expect(pos.fret).toBe(1);
      expect(pos.midi).toBe(65);
    });

    it('returns correct note at fret 12 (octave)', () => {
      const pos = getNoteAtPosition('E2', 12);
      expect(pos.note).toBe('E');
      expect(pos.octave).toBe(3);
      expect(pos.midi).toBe(52);
    });

    it('throws for invalid notes', () => {
      expect(() => getNoteAtPosition('X9', 0)).toThrow('Invalid note');
    });
  });

  describe('buildFretboard', () => {
    it('builds a fretboard with correct dimensions', () => {
      const tuning = ['E4', 'B3', 'G3', 'D3', 'A2', 'E2'];
      const fretboard = buildFretboard(tuning, 12);

      expect(fretboard).toHaveLength(6); // 6 strings
      expect(fretboard[0]).toHaveLength(13); // frets 0–12
    });

    it('assigns correct string indices', () => {
      const tuning = ['E4', 'B3'];
      const fretboard = buildFretboard(tuning, 3);

      expect(fretboard[0][0].string).toBe(0);
      expect(fretboard[1][0].string).toBe(1);
    });

    it('produces correct open string notes for standard guitar tuning', () => {
      const tuning = ['E4', 'B3', 'G3', 'D3', 'A2', 'E2'];
      const fretboard = buildFretboard(tuning, 5);

      const openNotes = fretboard.map((s) => s[0].note);
      expect(openNotes).toEqual(['E', 'B', 'G', 'D', 'A', 'E']);
    });
  });

  describe('filterByPitchClasses', () => {
    it('filters fretboard positions matching given pitch classes', () => {
      const tuning = ['E4', 'B3'];
      const fretboard = buildFretboard(tuning, 4);

      const filtered = filterByPitchClasses(fretboard, ['E', 'F']);
      expect(filtered.length).toBeGreaterThan(0);
      filtered.forEach((pos) => {
        expect(['E', 'F']).toContain(pos.note);
      });
    });

    it('returns empty array when no notes match', () => {
      const tuning = ['E4'];
      const fretboard = buildFretboard(tuning, 2);

      const filtered = filterByPitchClasses(fretboard, ['X']);
      expect(filtered).toEqual([]);
    });
  });
});
