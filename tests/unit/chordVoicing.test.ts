import { describe, it, expect } from 'vitest';
import {
  findVoicingInWindow,
  suggestVoicings,
  noteAtPosition,
} from '../../src/services/chordVoicing';

const GUITAR_TUNING = ['E2', 'A2', 'D3', 'G3', 'B3', 'E4'];

describe('chordVoicing service', () => {
  describe('findVoicingInWindow', () => {
    it('returns null for empty pitch classes', () => {
      const v = findVoicingInWindow([], GUITAR_TUNING, 1, 4);
      expect(v).toBeNull();
    });

    it('returns null when fewer than 3 strings can be assigned', () => {
      // Eb in frets 1-4: only D string (fret 1) and B string (fret 4) match → 2 strings → null
      const v = findVoicingInWindow(['Eb'], GUITAR_TUNING, 1, 4);
      expect(v).toBeNull();
    });

    it('finds an open-position E minor voicing (E, G, B)', () => {
      // Em = E G B — all 6 strings can be assigned in open position
      const v = findVoicingInWindow(['E', 'G', 'B'], GUITAR_TUNING, 1, 4);
      expect(v).not.toBeNull();
      expect(v!.baseFret).toBe(1);
      expect(v!.strings).toHaveLength(6);

      // Low E string (E2) should be 0 (open)
      expect(v!.strings[0]).toBe(0);
      // A string (A2): A is not in Em, so check for E, G, B — A2 fret 2 = B
      expect(v!.strings[1]).toBe(2); // A2 + 2 = B2
      // D string (D3): D fret 2 = E3
      expect(v!.strings[2]).toBe(2); // D3 + 2 = E3
      // G string (G3): open = G, which is in Em
      expect(v!.strings[3]).toBe(0);
      // B string (B3): open = B, which is in Em
      expect(v!.strings[4]).toBe(0);
      // High E string (E4): open = E, which is in Em
      expect(v!.strings[5]).toBe(0);
    });

    it('finds open-position A minor voicing (A, C, E)', () => {
      // Am = A C E
      const v = findVoicingInWindow(['A', 'C', 'E'], GUITAR_TUNING, 1, 4);
      expect(v).not.toBeNull();
      expect(v!.baseFret).toBe(1);
      // Low E string (E2): E is in Am — open
      expect(v!.strings[0]).toBe(0);
      // A string (A2): A is in Am — open
      expect(v!.strings[1]).toBe(0);
      // D string (D3): D3 fret 2 = E3 ✓
      expect(v!.strings[2]).toBe(2);
      // G string (G3): G3 fret 2 = A3 ✓
      expect(v!.strings[3]).toBe(2);
      // B string (B3): B3 fret 1 = C4 ✓
      expect(v!.strings[4]).toBe(1);
      // High E string (E4): open = E ✓
      expect(v!.strings[5]).toBe(0);
    });

    it('finds a position-5 voicing when windowStart is 5', () => {
      // C major (C, E, G) at fret 5 area
      const v = findVoicingInWindow(['C', 'E', 'G'], GUITAR_TUNING, 5, 4);
      expect(v).not.toBeNull();
      expect(v!.baseFret).toBe(5);
      // Strings that have chord notes in frets 5-8 should not be null
      const activeFrets = v!.strings.filter((f) => f !== null);
      expect(activeFrets.length).toBeGreaterThanOrEqual(3);
    });

    it('uses open strings only when windowStart is 1', () => {
      // In a window starting at fret 3, open strings should not be used even if they match
      const vOpen = findVoicingInWindow(['E', 'G', 'B'], GUITAR_TUNING, 1, 4);
      const vHigher = findVoicingInWindow(['E', 'G', 'B'], GUITAR_TUNING, 3, 4);

      // Open position should have at least one open string (fret 0)
      expect(vOpen!.strings.some((f) => f === 0)).toBe(true);

      // Window starting at 3 should have no open strings
      if (vHigher !== null) {
        expect(vHigher.strings.every((f) => f === null || f > 0)).toBe(true);
      }
    });

    it('returns strings array with same length as tuning', () => {
      const v = findVoicingInWindow(['C', 'E', 'G'], GUITAR_TUNING, 1, 4);
      expect(v!.strings).toHaveLength(GUITAR_TUNING.length);
    });
  });

  describe('suggestVoicings', () => {
    it('returns multiple voicings for C major', () => {
      const voicings = suggestVoicings(['C', 'E', 'G'], GUITAR_TUNING);
      expect(voicings.length).toBeGreaterThan(0);
    });

    it('returns at most maxVoicings results', () => {
      const voicings = suggestVoicings(['C', 'E', 'G'], GUITAR_TUNING, 4, 3);
      expect(voicings.length).toBeLessThanOrEqual(3);
    });

    it('returns voicings sorted by baseFret ascending', () => {
      const voicings = suggestVoicings(['C', 'E', 'G'], GUITAR_TUNING);
      for (let i = 1; i < voicings.length; i++) {
        expect(voicings[i].baseFret).toBeGreaterThanOrEqual(voicings[i - 1].baseFret);
      }
    });

    it('returns empty array for empty pitch classes', () => {
      const voicings = suggestVoicings([], GUITAR_TUNING);
      expect(voicings).toEqual([]);
    });

    it('each voicing has at least 3 active strings', () => {
      const voicings = suggestVoicings(['E', 'G', 'B'], GUITAR_TUNING);
      for (const v of voicings) {
        const active = v.strings.filter((f) => f !== null).length;
        expect(active).toBeGreaterThanOrEqual(3);
      }
    });
  });

  describe('noteAtPosition', () => {
    it('returns null for muted string', () => {
      expect(noteAtPosition('E2', null)).toBeNull();
    });

    it('returns pitch class for open string', () => {
      expect(noteAtPosition('E2', 0)).toBe('E');
    });

    it('returns correct pitch class at fret 5 on A string', () => {
      // A2 + 5 semitones = D3 → pitch class D
      expect(noteAtPosition('A2', 5)).toBe('D');
    });

    it('returns correct pitch class at fret 3 on low E string', () => {
      // E2 + 3 semitones = G2 → pitch class G
      expect(noteAtPosition('E2', 3)).toBe('G');
    });
  });
});
