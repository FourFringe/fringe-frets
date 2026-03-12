import { describe, it, expect } from 'vitest';
import { lookupVoicings, lookupVoicingNear, voicingFretSpan, findVoicingForRange } from '../../src/services/chordsDb';

describe('chordsDb service', () => {
  describe('lookupVoicings', () => {
    it('returns voicings for C major', () => {
      const voicings = lookupVoicings('C', 'major');
      expect(voicings.length).toBeGreaterThan(0);
    });

    it('returns 4 positions for C major', () => {
      const voicings = lookupVoicings('C', 'major');
      expect(voicings).toHaveLength(4);
    });

    it('returns voicings sorted by baseFret ascending', () => {
      const voicings = lookupVoicings('C', 'major');
      for (let i = 1; i < voicings.length; i++) {
        expect(voicings[i].baseFret).toBeGreaterThanOrEqual(voicings[i - 1].baseFret);
      }
    });

    it('converts C major open position correctly (x32010)', () => {
      const voicings = lookupVoicings('C', 'major');
      const open = voicings[0];
      expect(open.baseFret).toBe(1);
      // x32010: muted, fret 3, fret 2, open, fret 1, open
      expect(open.strings).toEqual([null, 3, 2, 0, 1, 0]);
    });

    it('converts C major barre position correctly (baseFret 3)', () => {
      const voicings = lookupVoicings('C', 'major');
      const barre = voicings[1];
      expect(barre.baseFret).toBe(3);
      // frets [1,1,3,3,3,1] at baseFret 3 → absolute [3,3,5,5,5,3]
      expect(barre.strings).toEqual([3, 3, 5, 5, 5, 3]);
    });

    it('returns voicings for minor chords', () => {
      const voicings = lookupVoicings('A', 'minor');
      expect(voicings.length).toBeGreaterThan(0);
    });

    it('returns voicings for diminished chords', () => {
      const voicings = lookupVoicings('B', 'diminished');
      expect(voicings.length).toBeGreaterThan(0);
    });

    it('handles enharmonic roots (D# → Eb)', () => {
      const voicings = lookupVoicings('D#', 'major');
      expect(voicings.length).toBeGreaterThan(0);
      // Should be the same as Eb major
      const ebVoicings = lookupVoicings('Eb', 'major');
      expect(voicings).toEqual(ebVoicings);
    });

    it('handles enharmonic roots (G# → Ab)', () => {
      const voicings = lookupVoicings('G#', 'minor');
      const abVoicings = lookupVoicings('Ab', 'minor');
      expect(voicings).toEqual(abVoicings);
    });

    it('returns empty array for unknown chord type', () => {
      const voicings = lookupVoicings('C', 'nonexistent-type');
      expect(voicings).toEqual([]);
    });

    it('returns empty array for invalid root', () => {
      const voicings = lookupVoicings('Z', 'major');
      expect(voicings).toEqual([]);
    });

    it('each voicing has 6 strings', () => {
      const voicings = lookupVoicings('G', 'major');
      for (const v of voicings) {
        expect(v.strings).toHaveLength(6);
      }
    });

    it('all 12 keys have major voicings', () => {
      const keys = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];
      for (const key of keys) {
        const voicings = lookupVoicings(key, 'major');
        expect(voicings.length).toBeGreaterThan(0);
      }
    });

    it('all 12 keys have minor voicings', () => {
      const keys = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];
      for (const key of keys) {
        const voicings = lookupVoicings(key, 'minor');
        expect(voicings.length).toBeGreaterThan(0);
      }
    });

    it('all 12 keys have diminished voicings', () => {
      const keys = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];
      for (const key of keys) {
        const voicings = lookupVoicings(key, 'diminished');
        expect(voicings.length).toBeGreaterThan(0);
      }
    });
  });

  describe('lookupVoicingNear', () => {
    it('returns the open position when targetFret is 1', () => {
      const v = lookupVoicingNear('C', 'major', 1);
      expect(v).not.toBeNull();
      expect(v!.baseFret).toBe(1);
    });

    it('returns a position at or above the target fret', () => {
      const v = lookupVoicingNear('C', 'major', 5);
      expect(v).not.toBeNull();
      expect(v!.baseFret).toBeGreaterThanOrEqual(5);
    });

    it('returns the highest available when target exceeds all positions', () => {
      const v = lookupVoicingNear('C', 'major', 20);
      expect(v).not.toBeNull();
      // Should be the last (highest) position
      const all = lookupVoicings('C', 'major');
      expect(v).toEqual(all[all.length - 1]);
    });

    it('returns null for unknown chord', () => {
      const v = lookupVoicingNear('Z', 'major', 1);
      expect(v).toBeNull();
    });
  });

  describe('voicingFretSpan', () => {
    it('returns correct span for a fretted voicing', () => {
      const span = voicingFretSpan({ strings: [null, 3, 2, 0, 1, 0], baseFret: 1 });
      expect(span).toEqual({ minFret: 1, maxFret: 3 });
    });

    it('returns correct span for a barre chord', () => {
      const span = voicingFretSpan({ strings: [3, 3, 5, 5, 5, 3], baseFret: 3 });
      expect(span).toEqual({ minFret: 3, maxFret: 5 });
    });

    it('returns null for all-open voicing', () => {
      const span = voicingFretSpan({ strings: [0, 0, 0, 0, 0, 0], baseFret: 1 });
      expect(span).toBeNull();
    });

    it('returns null for all-muted voicing', () => {
      const span = voicingFretSpan({ strings: [null, null, null, null, null, null], baseFret: 1 });
      expect(span).toBeNull();
    });

    it('ignores open strings in span calculation', () => {
      // Only fret 5 is fretted
      const span = voicingFretSpan({ strings: [0, 0, 5, 0, 0, 0], baseFret: 1 });
      expect(span).toEqual({ minFret: 5, maxFret: 5 });
    });
  });

  describe('findVoicingForRange', () => {
    it('returns a voicing whose fretted notes fall within the range', () => {
      const v = findVoicingForRange('C', 'major', 1, 4);
      expect(v).not.toBeNull();
      const fretted = v!.strings.filter((f): f is number => f !== null && f > 0);
      for (const f of fretted) {
        expect(f).toBeGreaterThanOrEqual(1);
        expect(f).toBeLessThanOrEqual(4);
      }
    });

    it('returns null for unknown chord', () => {
      expect(findVoicingForRange('Z', 'major', 1, 4)).toBeNull();
    });

    it('prefers a voicing closer to preferPosIdx when multiple fit', () => {
      // C major has 4 positions; position 0 (open) fits range [1,4]
      const v = findVoicingForRange('C', 'major', 1, 4, 0);
      expect(v).not.toBeNull();
      expect(v!.baseFret).toBe(1); // open C chord
    });

    it('finds an alternative position when the preferred posIdx does not fit', () => {
      // Ask for a voicing near posIdx 3 but in a low fret range
      const v = findVoicingForRange('A', 'minor', 1, 5, 3);
      expect(v).not.toBeNull();
      const fretted = v!.strings.filter((f): f is number => f !== null && f > 0);
      for (const f of fretted) {
        expect(f).toBeGreaterThanOrEqual(1);
        expect(f).toBeLessThanOrEqual(5);
      }
    });

    it('returns the best partial match when no voicing fits perfectly', () => {
      // Narrow range that likely won't perfectly contain any D minor voicing
      const v = findVoicingForRange('D', 'minor', 4, 5);
      // Should still return something (partial) or null if truly nothing overlaps
      if (v) {
        const fretted = v.strings.filter((f): f is number => f !== null && f > 0);
        const inRange = fretted.filter((f) => f >= 4 && f <= 5);
        expect(inRange.length).toBeGreaterThan(0);
      }
    });

    it('returns a voicing with 6 strings', () => {
      const v = findVoicingForRange('G', 'major', 2, 6);
      expect(v).not.toBeNull();
      expect(v!.strings).toHaveLength(6);
    });
  });
});
