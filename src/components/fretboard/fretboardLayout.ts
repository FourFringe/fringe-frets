/**
 * Layout constants and geometry helpers for the fretboard SVG.
 *
 * All values are in SVG user-space units. A fretboard is drawn horizontally:
 * strings run left-to-right, frets are vertical dividers.
 *
 * ┌─nut─┬───fret 1───┬───fret 2───┬── …
 * │  E4 │            │     ●      │
 * │  B3 │     ●      │            │
 * │  G3 │            │            │
 * │  D3 │            │     ●      │
 * │  A2 │     ●      │            │
 * │  E2 │            │            │
 * └─────┴────────────┴────────────┴── …
 */

/** Pixel gap between adjacent strings. */
export const STRING_SPACING = 24;

/** Pixel gap between adjacent frets. */
export const FRET_SPACING = 56;

/** Left margin before the nut (room for string labels). */
export const LEFT_MARGIN = 46;

/** Top margin above the first string (room for fret numbers). */
export const TOP_MARGIN = 28;

/** Bottom margin below the last string. */
export const BOTTOM_MARGIN = 16;

/** Right margin after the last fret. */
export const RIGHT_MARGIN = 16;

/** Radius of a highlighted note dot. */
export const DOT_RADIUS = 9;

/** Radius of a root-note dot (slightly larger). */
export const ROOT_DOT_RADIUS = 10;

/** Width of the nut (fret-0 bar). */
export const NUT_WIDTH = 4;

/** Fret wire width. */
export const FRET_WIDTH = 1.5;

/** String wire width. */
export const STRING_WIDTH = 1;

// ─── Geometry helpers ───────────────────────────────────────────────────

/** Total SVG width for a given number of frets. */
export function svgWidth(fretCount: number): number {
  return LEFT_MARGIN + NUT_WIDTH + fretCount * FRET_SPACING + RIGHT_MARGIN;
}

/** Total SVG height for a given number of strings. */
export function svgHeight(stringCount: number): number {
  return TOP_MARGIN + (stringCount - 1) * STRING_SPACING + BOTTOM_MARGIN;
}

/** X coordinate of a fret line (1-based). Fret 0 is the nut. */
export function fretX(fret: number): number {
  if (fret === 0) return LEFT_MARGIN;
  return LEFT_MARGIN + NUT_WIDTH + fret * FRET_SPACING;
}

/** X coordinate of the center of a fret space (between fret-1 and fret). */
export function fretCenterX(fret: number): number {
  if (fret === 0) return LEFT_MARGIN - DOT_RADIUS - 4;
  const left = fretX(fret - 1);
  const right = fretX(fret);
  return (left + right) / 2;
}

/** Y coordinate of a string (0-based, top string = 0). */
export function stringY(stringIndex: number): number {
  return TOP_MARGIN + stringIndex * STRING_SPACING;
}
