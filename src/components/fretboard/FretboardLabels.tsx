import {
  fretX,
  fretY,
  fretCenterX,
  fretCenterY,
  stringY,
  stringX,
  STRING_LABEL_X,
  STRING_LABEL_TOP_Y,
  VERT_LEFT_MARGIN,
  VERT_LABEL_INSET,
} from './fretboardLayout';
import { Note } from 'tonal';
import type { FretboardOrientation } from './FretboardGrid';

interface FretboardLabelsProps {
  /** Open-string tuning notes (e.g. ["E2", "A2", "D3", "G3", "B3", "E4"]). */
  tuning: string[];
  /** Number of fret columns visible. */
  fretCount: number;
  /** Starting fret number. */
  startFret: number;
  orientation?: FretboardOrientation;
}

/**
 * Renders text labels: string names and fret numbers.
 * Horizontal: string names on left, fret numbers along the top.
 * Vertical:   string names above the nut, fret numbers on the left.
 */
export function FretboardLabels({ tuning, fretCount, startFret, orientation = 'horizontal' }: FretboardLabelsProps) {
  const elements: React.ReactElement[] = [];

  const stringCount = tuning.length;

  // Standard fret positions that get a number label (matches inlay dot positions)
  const labeledFrets = new Set([1, 3, 5, 7, 9, 12, 15, 17, 19, 21, 24]);

  if (orientation === 'horizontal') {
    // ── Horizontal: string names on left, fret numbers along top ────────
    tuning.forEach((note, i) => {
      const pc = Note.pitchClass(note) || note;
      elements.push(
        <text
          key={`str-label-${i}`}
          x={STRING_LABEL_X}
          y={stringY(i, stringCount)}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={12}
          fontWeight={600}
          fill="var(--fb-label, #aaa)"
        >
          {pc}
        </text>,
      );
    });

    // Fret numbers along the top.
    // When startFret === 0: fret wire i labels absolute fret i.
    // When startFret > 0:  wire i labels (startFret + i - 1).
    for (let i = 1; i <= fretCount; i++) {
      const absoluteFret = startFret === 0 ? i : startFret + i - 1;
      if (labeledFrets.has(absoluteFret)) {
        const cx = (fretX(i - 1) + fretX(i)) / 2;
        elements.push(
          <text
            key={`fret-label-${i}`}
            x={cx}
            y={stringY(stringCount - 1, stringCount) - 12}
            textAnchor="middle"
            fontSize={10}
            fill="var(--fb-label, #888)"
          >
            {absoluteFret}
          </text>,
        );
      }
    }

    // Open-string "0" label when starting from fret 0
    if (startFret === 0) {
      elements.push(
        <text
          key="fret-label-0"
          x={fretCenterX(0)}
          y={stringY(stringCount - 1, stringCount) - 12}
          textAnchor="middle"
          fontSize={10}
          fill="var(--fb-label, #888)"
        >
          0
        </text>,
      );
    }
  } else {
    // ── Vertical: string names above nut, fret numbers on left ──────────
    tuning.forEach((note, i) => {
      const pc = Note.pitchClass(note) || note;
      elements.push(
        <text
          key={`str-label-${i}`}
          x={stringX(i)}
          y={STRING_LABEL_TOP_Y}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={12}
          fontWeight={600}
          fill="var(--fb-label, #aaa)"
        >
          {pc}
        </text>,
      );
    });

    // Fret numbers on the left.
    // Same formula as horizontal but using fretCenterY instead of cx.
    for (let i = 1; i <= fretCount; i++) {
      const absoluteFret = startFret === 0 ? i : startFret + i - 1;
      if (labeledFrets.has(absoluteFret)) {
        const cy = (fretY(i - 1) + fretY(i)) / 2;
        elements.push(
          <text
            key={`fret-label-${i}`}
            x={VERT_LEFT_MARGIN - VERT_LABEL_INSET}
            y={cy}
            textAnchor="end"
            dominantBaseline="central"
            fontSize={10}
            fill="var(--fb-label, #888)"
          >
            {absoluteFret}
          </text>,
        );
      }
    }

    // Open-string "0" label when starting from fret 0
    if (startFret === 0) {
      elements.push(
        <text
          key="fret-label-0"
          x={VERT_LEFT_MARGIN - VERT_LABEL_INSET}
          y={fretCenterY(0)}
          textAnchor="end"
          dominantBaseline="central"
          fontSize={10}
          fill="var(--fb-label, #888)"
        >
          0
        </text>,
      );
    }
  }

  return <g data-testid="fretboard-labels">{elements}</g>;
}
