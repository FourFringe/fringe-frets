import {
  fretX,
  fretY,
  stringY,
  stringX,
  NUT_WIDTH,
  FRET_WIDTH,
  STRING_WIDTH,
  VERT_LEFT_MARGIN,
} from './fretboardLayout';

export type FretboardOrientation = 'horizontal' | 'vertical';

interface FretboardGridProps {
  stringCount: number;
  fretCount: number;
  /** Starting fret number (0 = open / nut). */
  startFret: number;
  orientation?: FretboardOrientation;
}

/**
 * Renders the static grid: nut, fret wires, strings, and fret-position dot
 * markers (dots on frets 3, 5, 7, 9, 12, 15, 17, 19, 21, 24).
 */
export function FretboardGrid({
  stringCount,
  fretCount,
  startFret,
  orientation = 'horizontal',
}: FretboardGridProps) {
  // Single-dot fret positions and double-dot (octave) fret positions
  const singleDotFrets = new Set([3, 5, 7, 9, 15, 17, 19, 21]);
  const doubleDotFrets = new Set([12, 24]);

  const elements: React.ReactElement[] = [];

  if (orientation === 'horizontal') {
    // ── Horizontal layout ───────────────────────────────────────────────
    // String 0 (low E) at the bottom, string (count-1) at the top.
    const topY = stringY(stringCount - 1, stringCount);
    const bottomY = stringY(0, stringCount);

    // Nut (thick bar at fret 0), only shown when startFret is 0
    if (startFret === 0) {
      elements.push(
        <rect
          key="nut"
          x={fretX(0)}
          y={topY}
          width={NUT_WIDTH}
          height={bottomY - topY}
          fill="var(--fb-nut, #e0e0e0)"
        />,
      );
    }

    // Fret wires — omit the rightmost wire so the right edge stays open.
    for (let i = 1; i <= fretCount - 1; i++) {
      const x = fretX(i);
      elements.push(
        <line
          key={`fret-${i}`}
          x1={x}
          y1={topY}
          x2={x}
          y2={bottomY}
          stroke="var(--fb-fret, #888)"
          strokeWidth={FRET_WIDTH}
        />,
      );
    }

    // Strings
    const rightEdge = fretX(fretCount);
    for (let s = 0; s < stringCount; s++) {
      const y = stringY(s, stringCount);
      elements.push(
        <line
          key={`string-${s}`}
          x1={fretX(0)}
          y1={y}
          x2={rightEdge}
          y2={y}
          stroke="var(--fb-string, #888)"
          strokeWidth={STRING_WIDTH}
        />,
      );
    }

    // Inlay dots (decorative)
    const midY = (topY + bottomY) / 2;
    const quarterY = topY + (bottomY - topY) / 4;
    const threeQuarterY = topY + ((bottomY - topY) * 3) / 4;

    for (let i = 1; i <= fretCount; i++) {
      const absoluteFret = startFret + i;
      const cx = (fretX(i - 1) + fretX(i)) / 2;
      if (singleDotFrets.has(absoluteFret)) {
        elements.push(
          <circle key={`inlay-${i}`} cx={cx} cy={midY} r={3} fill="var(--fb-inlay, #333)" />,
        );
      } else if (doubleDotFrets.has(absoluteFret)) {
        elements.push(
          <circle key={`inlay-${i}a`} cx={cx} cy={quarterY} r={3} fill="var(--fb-inlay, #333)" />,
          <circle
            key={`inlay-${i}b`}
            cx={cx}
            cy={threeQuarterY}
            r={3}
            fill="var(--fb-inlay, #333)"
          />,
        );
      }
    }
  } else {
    // ── Vertical layout ─────────────────────────────────────────────────
    // String 0 (low E) at the left, string (count-1) at the right.
    // Frets run top → bottom; nut at the top.
    const leftX = stringX(0);
    const rightX = stringX(stringCount - 1);

    // Nut (thick horizontal bar), only shown when startFret is 0
    if (startFret === 0) {
      elements.push(
        <rect
          key="nut"
          x={leftX}
          y={fretY(0)}
          width={rightX - leftX}
          height={NUT_WIDTH}
          fill="var(--fb-nut, #e0e0e0)"
        />,
      );
    }

    // Fret wires (horizontal) — omit the bottom wire so the bottom edge stays open.
    for (let i = 1; i <= fretCount - 1; i++) {
      const y = fretY(i);
      elements.push(
        <line
          key={`fret-${i}`}
          x1={leftX}
          y1={y}
          x2={rightX}
          y2={y}
          stroke="var(--fb-fret, #888)"
          strokeWidth={FRET_WIDTH}
        />,
      );
    }

    // Strings (vertical lines)
    const bottomEdge = fretY(fretCount);
    for (let s = 0; s < stringCount; s++) {
      const x = stringX(s);
      elements.push(
        <line
          key={`string-${s}`}
          x1={x}
          y1={fretY(0)}
          x2={x}
          y2={bottomEdge}
          stroke="var(--fb-string, #888)"
          strokeWidth={STRING_WIDTH}
        />,
      );
    }

    // Inlay dots (decorative)
    const midX = (leftX + rightX) / 2;
    const quarterX = leftX + (rightX - leftX) / 4;
    const threeQuarterX = leftX + ((rightX - leftX) * 3) / 4;

    for (let i = 1; i <= fretCount; i++) {
      const absoluteFret = startFret + i;
      const cy = (fretY(i - 1) + fretY(i)) / 2;
      if (singleDotFrets.has(absoluteFret)) {
        elements.push(
          <circle key={`inlay-${i}`} cx={midX} cy={cy} r={3} fill="var(--fb-inlay, #333)" />,
        );
      } else if (doubleDotFrets.has(absoluteFret)) {
        elements.push(
          <circle key={`inlay-${i}a`} cx={quarterX} cy={cy} r={3} fill="var(--fb-inlay, #333)" />,
          <circle
            key={`inlay-${i}b`}
            cx={threeQuarterX}
            cy={cy}
            r={3}
            fill="var(--fb-inlay, #333)"
          />,
        );
      }
    }

    // Left-edge border line (replaces the nut visual boundary when startFret > 0
    // or provides a clean frame edge)
    if (startFret > 0) {
      elements.push(
        <line
          key="left-border"
          x1={VERT_LEFT_MARGIN}
          y1={fretY(0)}
          x2={VERT_LEFT_MARGIN}
          y2={bottomEdge}
          stroke="transparent"
          strokeWidth={0}
        />,
      );
    }
  }

  return <g data-testid="fretboard-grid">{elements}</g>;
}
