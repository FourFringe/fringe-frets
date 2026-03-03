import { describe, it, expect } from 'vitest';
import {
  svgWidth,
  svgHeight,
  fretX,
  fretCenterX,
  stringY,
  STRING_SPACING,
  FRET_SPACING,
  LEFT_MARGIN,
  TOP_MARGIN,
  NUT_WIDTH,
  RIGHT_MARGIN,
  BOTTOM_MARGIN,
} from '../../src/components/fretboard/fretboardLayout';

describe('fretboardLayout', () => {
  describe('svgWidth', () => {
    it('accounts for left margin, nut, fret spacing, and right margin', () => {
      const width = svgWidth(5);
      expect(width).toBe(LEFT_MARGIN + NUT_WIDTH + 5 * FRET_SPACING + RIGHT_MARGIN);
    });

    it('returns minimal width for zero frets', () => {
      const width = svgWidth(0);
      expect(width).toBe(LEFT_MARGIN + NUT_WIDTH + RIGHT_MARGIN);
    });
  });

  describe('svgHeight', () => {
    it('accounts for top margin, string spacing, and bottom margin', () => {
      const height = svgHeight(6);
      expect(height).toBe(TOP_MARGIN + 5 * STRING_SPACING + BOTTOM_MARGIN);
    });

    it('handles single string', () => {
      const height = svgHeight(1);
      expect(height).toBe(TOP_MARGIN + BOTTOM_MARGIN);
    });
  });

  describe('fretX', () => {
    it('returns LEFT_MARGIN for fret 0 (nut)', () => {
      expect(fretX(0)).toBe(LEFT_MARGIN);
    });

    it('places fret 1 after the nut', () => {
      expect(fretX(1)).toBe(LEFT_MARGIN + NUT_WIDTH + FRET_SPACING);
    });

    it('spaces frets evenly', () => {
      const diff = fretX(3) - fretX(2);
      expect(diff).toBe(FRET_SPACING);
    });
  });

  describe('fretCenterX', () => {
    it('returns center between fret n-1 and fret n for fret >= 1', () => {
      const center = fretCenterX(1);
      const expected = (fretX(0) + fretX(1)) / 2;
      expect(center).toBe(expected);
    });
  });

  describe('stringY', () => {
    it('places the first string at TOP_MARGIN', () => {
      expect(stringY(0)).toBe(TOP_MARGIN);
    });

    it('spaces strings evenly', () => {
      const diff = stringY(2) - stringY(1);
      expect(diff).toBe(STRING_SPACING);
    });
  });
});
