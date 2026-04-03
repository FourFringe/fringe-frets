import { describe, it, expect } from 'vitest';
import { findScalePositions } from '../../src/services/scalePositions';

const GUITAR_TUNING = ['E2', 'A2', 'D3', 'G3', 'B3', 'E4'];

describe('findScalePositions', () => {
  it('returns an empty array for an empty scale', () => {
    expect(findScalePositions(GUITAR_TUNING, [])).toEqual([]);
  });

  it('finds positions for C major on guitar', () => {
    const cMajor = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
    const positions = findScalePositions(GUITAR_TUNING, cMajor, 15, 4, 2);

    expect(positions.length).toBeGreaterThan(0);

    for (const pos of positions) {
      expect(pos).toBeGreaterThanOrEqual(0);
      expect(pos).toBeLessThanOrEqual(15);
    }
  });

  it('positions are at least minGap frets apart', () => {
    const cMajor = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
    const minGap = 2;
    const positions = findScalePositions(GUITAR_TUNING, cMajor, 15, 4, minGap);

    for (let i = 1; i < positions.length; i++) {
      expect(positions[i] - positions[i - 1]).toBeGreaterThanOrEqual(minGap);
    }
  });

  it('positions are in ascending order', () => {
    const cMajor = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
    const positions = findScalePositions(GUITAR_TUNING, cMajor, 15, 4, 2);

    for (let i = 1; i < positions.length; i++) {
      expect(positions[i]).toBeGreaterThan(positions[i - 1]);
    }
  });

  it('finds positions for A minor pentatonic', () => {
    const aMinPent = ['A', 'C', 'D', 'E', 'G'];
    const positions = findScalePositions(GUITAR_TUNING, aMinPent, 15, 4, 2);

    expect(positions.length).toBeGreaterThan(0);
    expect(positions.length).toBeGreaterThanOrEqual(3);
  });

  it('respects a larger minGap', () => {
    const cMajor = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
    const positions2 = findScalePositions(GUITAR_TUNING, cMajor, 15, 4, 2);
    const positions4 = findScalePositions(GUITAR_TUNING, cMajor, 15, 4, 4);

    expect(positions4.length).toBeLessThanOrEqual(positions2.length);

    for (let i = 1; i < positions4.length; i++) {
      expect(positions4[i] - positions4[i - 1]).toBeGreaterThanOrEqual(4);
    }
  });

  it('handles a smaller fret range', () => {
    const cMajor = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
    const positions = findScalePositions(GUITAR_TUNING, cMajor, 5, 4, 2);

    expect(positions.length).toBeLessThanOrEqual(2);
  });
});
