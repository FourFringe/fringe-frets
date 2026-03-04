import {
  fretX,
  stringY,
  NUT_WIDTH,
  FRET_WIDTH,
  STRING_WIDTH,
} from './fretboardLayout';

interface FretboardGridProps {
  stringCount: number;
  fretCount: number;
  /** Starting fret number (0 = open / nut). */
  startFret: number;
}

/**
 * Renders the static grid: nut, fret wires, strings, and fret-position dot
 * markers (dots on frets 3, 5, 7, 9, 12, 15, 17, 19, 21, 24).
 */
export function FretboardGrid({ stringCount, fretCount, startFret }: FretboardGridProps) {
  // After inversion: string 0 (low E) is at the bottom, string (count-1) at the top.
  const topY = stringY(stringCount - 1, stringCount);
  const bottomY = stringY(0, stringCount);

  // Single-dot fret positions and double-dot (octave) fret positions
  const singleDotFrets = new Set([3, 5, 7, 9, 15, 17, 19, 21]);
  const doubleDotFrets = new Set([12, 24]);

  const elements: React.ReactElement[] = [];

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

  // Fret wires
  for (let i = 1; i <= fretCount; i++) {
    const x = fretX(i);
    elements.push(
      <line
        key={`fret-${i}`}
        x1={x}
        y1={topY}
        x2={x}
        y2={bottomY}
        stroke="var(--fb-fret, #555)"
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
        stroke="var(--fb-string, #aaa)"
        strokeWidth={STRING_WIDTH}
      />,
    );
  }

  // Fret-position inlay dots (between strings, purely decorative)
  const midY = (topY + bottomY) / 2;
  const quarterY = topY + (bottomY - topY) / 4;
  const threeQuarterY = topY + ((bottomY - topY) * 3) / 4;

  for (let i = 1; i <= fretCount; i++) {
    const absoluteFret = startFret + i;
    const cx = (fretX(i - 1) + fretX(i)) / 2;

    if (singleDotFrets.has(absoluteFret)) {
      elements.push(
        <circle
          key={`inlay-${i}`}
          cx={cx}
          cy={midY}
          r={3}
          fill="var(--fb-inlay, #333)"
        />,
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

  return <g data-testid="fretboard-grid">{elements}</g>;
}
