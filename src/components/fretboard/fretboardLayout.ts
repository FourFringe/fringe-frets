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

/**
 * X coordinate shared by string-name labels and open-string dot indicators.
 * Both use textAnchor="middle" / circle cx at this value so they align.
 */
export const STRING_LABEL_X = LEFT_MARGIN - 16; // = 30

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

/**
 * Y coordinate of a string in horizontal orientation.
 *
 * stringIndex is 0-based where 0 = the lowest-pitched / thickest string
 * (e.g. low E on guitar).  Index 0 maps to the BOTTOM of the diagram so the
 * fretboard matches its physical orientation (low string at the bottom).
 */
export function stringY(stringIndex: number, stringCount: number): number {
  return TOP_MARGIN + (stringCount - 1 - stringIndex) * STRING_SPACING;
}

// ─── Vertical orientation helpers ────────────────────────────────────────────
//
// In vertical orientation the neck points upward:
//   •  Strings run left → right  (index 0 = low E = leftmost)
//   •  Frets  run top  → bottom  (nut at top, higher frets below)
//
// Constants shared with horizontal: STRING_SPACING, FRET_SPACING, NUT_WIDTH,
// DOT_RADIUS, TOP_MARGIN, RIGHT_MARGIN, BOTTOM_MARGIN.
// ─────────────────────────────────────────────────────────────────────────────

/** Left margin in vertical orientation — room for fret-number labels.
 * Must be large enough that labels at (VERT_LEFT_MARGIN - VERT_LABEL_INSET)
 * clear the string-0 dot circle (radius ROOT_DOT_RADIUS = 10). */
export const VERT_LEFT_MARGIN = 52;

/** Horizontal distance from VERT_LEFT_MARGIN to the right edge of fret-number text. */
export const VERT_LABEL_INSET = 14;

/**
 * Y coordinate for string-name labels above the nut in vertical orientation.
 * Mirrors STRING_LABEL_X in horizontal mode.
 */
export const STRING_LABEL_TOP_Y = TOP_MARGIN - 14;

/** Total SVG width in vertical orientation. */
export function svgWidth_v(stringCount: number): number {
  return VERT_LEFT_MARGIN + (stringCount - 1) * STRING_SPACING + RIGHT_MARGIN;
}

/** Total SVG height in vertical orientation. */
export function svgHeight_v(fretCount: number): number {
  return TOP_MARGIN + NUT_WIDTH + fretCount * FRET_SPACING + BOTTOM_MARGIN;
}

/**
 * X coordinate of a string in vertical orientation.
 * Index 0 (low E) maps to the leftmost string column.
 */
export function stringX(stringIndex: number): number {
  return VERT_LEFT_MARGIN + stringIndex * STRING_SPACING;
}

/**
 * Y coordinate of a fret line (1-based) in vertical orientation.
 * Fret 0 is the nut (top edge of nut rect).
 */
export function fretY(fret: number): number {
  if (fret === 0) return TOP_MARGIN;
  return TOP_MARGIN + NUT_WIDTH + fret * FRET_SPACING;
}

/**
 * Y coordinate of the center of a fret space in vertical orientation.
 * Fret 0 is the open-string area above the nut.
 */
export function fretCenterY(fret: number): number {
  if (fret === 0) return TOP_MARGIN - DOT_RADIUS - 4;
  return (fretY(fret - 1) + fretY(fret)) / 2;
}
