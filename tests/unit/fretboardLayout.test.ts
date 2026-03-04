import { describe, it, expect } from 'vitest';
import {
  svgWidth,
  svgHeight,
  svgWidth_v,
  svgHeight_v,
  fretX,
  fretCenterX,
  fretY,
  fretCenterY,
  stringY,
  stringX,
  STRING_SPACING,
  FRET_SPACING,
  LEFT_MARGIN,
  TOP_MARGIN,
  NUT_WIDTH,
  RIGHT_MARGIN,
  BOTTOM_MARGIN,
  STRING_LABEL_X,
  VERT_LEFT_MARGIN,
  VERT_LABEL_INSET,
  ROOT_DOT_RADIUS,
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
    it('places the highest-pitched string (last index) at the top', () => {
      // string index 5 of 6 → top of diagram
      expect(stringY(5, 6)).toBe(TOP_MARGIN);
    });

    it('places the lowest-pitched string (index 0) at the bottom', () => {
      // string index 0 of 6 → bottom of diagram
      expect(stringY(0, 6)).toBe(TOP_MARGIN + 5 * STRING_SPACING);
    });

    it('spaces strings evenly', () => {
      // Adjacent strings differ by exactly STRING_SPACING in y
      const diff = Math.abs(stringY(2, 6) - stringY(1, 6));
      expect(diff).toBe(STRING_SPACING);
    });

    it('STRING_LABEL_X is within the left margin', () => {
      expect(STRING_LABEL_X).toBeGreaterThan(0);
      expect(STRING_LABEL_X).toBeLessThan(LEFT_MARGIN);
    });
  });

  // ─── Vertical orientation helpers ────────────────────────────────────────

  describe('svgWidth_v', () => {
    it('is driven by string count, not fret count', () => {
      expect(svgWidth_v(6)).toBe(VERT_LEFT_MARGIN + 5 * STRING_SPACING + RIGHT_MARGIN);
    });

    it('handles single string', () => {
      expect(svgWidth_v(1)).toBe(VERT_LEFT_MARGIN + RIGHT_MARGIN);
    });

    it('VERT_LEFT_MARGIN leaves enough room for labels to clear string-0 dot radius', () => {
      // label right edge at (VERT_LEFT_MARGIN - VERT_LABEL_INSET)
      // string-0 dot left edge at (VERT_LEFT_MARGIN - ROOT_DOT_RADIUS)
      // label must be fully left of the dot left edge
      expect(VERT_LEFT_MARGIN - VERT_LABEL_INSET).toBeLessThan(
        VERT_LEFT_MARGIN - ROOT_DOT_RADIUS,
      );
    });
  });

  describe('svgHeight_v', () => {
    it('is driven by fret count, not string count', () => {
      expect(svgHeight_v(12)).toBe(TOP_MARGIN + NUT_WIDTH + 12 * FRET_SPACING + BOTTOM_MARGIN);
    });
  });

  describe('stringX', () => {
    it('places string 0 (low E) at VERT_LEFT_MARGIN', () => {
      expect(stringX(0)).toBe(VERT_LEFT_MARGIN);
    });

    it('places higher-index strings further right', () => {
      expect(stringX(1)).toBeGreaterThan(stringX(0));
      expect(stringX(5)).toBeGreaterThan(stringX(4));
    });

    it('spaces strings evenly by STRING_SPACING', () => {
      expect(stringX(1) - stringX(0)).toBe(STRING_SPACING);
    });
  });

  describe('fretY', () => {
    it('returns TOP_MARGIN for fret 0 (nut position)', () => {
      expect(fretY(0)).toBe(TOP_MARGIN);
    });

    it('places fret 1 below the nut', () => {
      expect(fretY(1)).toBe(TOP_MARGIN + NUT_WIDTH + FRET_SPACING);
    });

    it('spaces fret wires evenly by FRET_SPACING', () => {
      expect(fretY(3) - fretY(2)).toBe(FRET_SPACING);
    });
  });

  describe('fretCenterY', () => {
    it('returns center between fret n-1 and fret n for fret >= 1', () => {
      expect(fretCenterY(1)).toBe((fretY(0) + fretY(1)) / 2);
    });

    it('is above the nut for fret 0 (open string area)', () => {
      expect(fretCenterY(0)).toBeLessThan(TOP_MARGIN);
    });
  });
});
