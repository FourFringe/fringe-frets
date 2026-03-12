/**
 * Layout constants and geometry helpers for chord-box SVG diagrams.
 *
 * A chord box is drawn vertically — strings run top-to-bottom, frets are
 * horizontal dividers.  The lowest-pitched string is on the left.
 *
 *            X  O  .  .  O  .
 *            │  │  │  │  │  │   ← nut (thick) / top fret line
 *            │  ●  │  ●  │  │
 *            │  │  │  │  │  │
 *            │  │  ●  │  │  ●  2fr (shown when baseFret > 1)
 *            │  │  │  │  │  │
 *            │  │  │  │  ●  │
 *            │  │  │  │  │  │
 */

/** Horizontal gap between adjacent strings. */
export const CB_STRING_SPACING = 22;

/** Vertical gap between adjacent fret lines. */
export const CB_FRET_SPACING = 24;

/** Left margin (room for "Nfr" position label). */
export const CB_LEFT_MARGIN = 30;

/** Right margin. */
export const CB_RIGHT_MARGIN = 8;

/** Top margin above the indicator row. */
export const CB_TOP_MARGIN = 8;

/** Vertical space reserved for X / O string indicators. */
export const CB_INDICATOR_HEIGHT = 28;

/** Bottom margin below the lowest fret line. */
export const CB_BOTTOM_MARGIN = 10;

/** Radius of a regular dot. */
export const CB_DOT_RADIUS = 8;

/** Radius of the root-note dot (slightly larger). */
export const CB_ROOT_DOT_RADIUS = 9;

/** Thickness of the nut bar (open position). */
export const CB_NUT_HEIGHT = 6;

/** Width of normal fret wires. */
export const CB_WIRE_WIDTH = 1.5;

/** Width of string wires. */
export const CB_STRING_WIDTH = 1;

// ─── Geometry helpers ────────────────────────────────────────────────────────

/** Total SVG width for a given number of strings. */
export function cbWidth(stringCount: number): number {
  return CB_LEFT_MARGIN + (stringCount - 1) * CB_STRING_SPACING + CB_RIGHT_MARGIN;
}

/** Total SVG height for a given fret-window size. */
export function cbHeight(fretWindow: number): number {
  return (
    CB_TOP_MARGIN + CB_INDICATOR_HEIGHT + fretWindow * CB_FRET_SPACING + CB_BOTTOM_MARGIN
  );
}

/** X coordinate of string i (0 = lowest-pitched string, on the left). */
export function cbStringX(stringIndex: number): number {
  return CB_LEFT_MARGIN + stringIndex * CB_STRING_SPACING;
}

/**
 * Y coordinate of the top of the diagram grid (where the nut / first fret line sits).
 */
export function cbGridTop(): number {
  return CB_TOP_MARGIN + CB_INDICATOR_HEIGHT;
}

/**
 * Y coordinate of a fret line.
 *   row 0 → nut / top line
 *   row 1 → first fret wire
 *   …
 */
export function cbFretLineY(row: number): number {
  return cbGridTop() + row * CB_FRET_SPACING;
}

/**
 * Y coordinate of the center of a fret space.
 *   fretSpace 1 → space between nut and fret-wire 1  (finger on "fret 1")
 *   fretSpace 2 → space between fret-wire 1 and 2    (finger on "fret 2")
 */
export function cbDotCY(fretSpace: number): number {
  return cbGridTop() + (fretSpace - 0.5) * CB_FRET_SPACING;
}

/** Y coordinate centre of the open/muted indicator row. */
export function cbIndicatorY(): number {
  return CB_TOP_MARGIN + CB_INDICATOR_HEIGHT / 2;
}
