import { fretX, fretCenterX, stringY, STRING_LABEL_X } from './fretboardLayout';
import { Note } from 'tonal';

interface FretboardLabelsProps {
  /** Open-string tuning notes (e.g. ["E2", "A2", "D3", "G3", "B3", "E4"]). */
  tuning: string[];
  /** Number of fret columns visible. */
  fretCount: number;
  /** Starting fret number. */
  startFret: number;
}

/**
 * Renders text labels: string names on the left edge, fret numbers along the top.
 */
export function FretboardLabels({ tuning, fretCount, startFret }: FretboardLabelsProps) {
  const elements: React.ReactElement[] = [];

  const stringCount = tuning.length;

  // String labels (pitch class only, no octave)
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

  // Standard fret positions that get a number label (matches inlay dot positions)
  const labeledFrets = new Set([1, 3, 5, 7, 9, 12, 15, 17, 19, 21, 24]);

  // Fret numbers along the top.
  // When startFret === 0: fret wire i labels absolute fret i.
  // When startFret > 0:  fret wire i labels absolute fret (startFret + i - 1)
  // because the +1 display shift means wire 1 is the right edge of fret startFret.
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

  return <g data-testid="fretboard-labels">{elements}</g>;
}
