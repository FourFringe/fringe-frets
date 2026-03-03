import { fretCenterX, stringY, DOT_RADIUS, ROOT_DOT_RADIUS } from './fretboardLayout';
import type { FretPosition } from '../../models/music';

interface FretboardDotsProps {
  /** Positions to highlight on the fretboard. */
  positions: FretPosition[];
  /** The root note pitch class (e.g. "C") — gets a distinct color. */
  root?: string;
  /** Whether to show note names inside the dots. */
  showNoteNames: boolean;
  /** Starting fret of the visible window (used to offset x positions). */
  startFret: number;
}

/**
 * Renders highlighted note dots on the fretboard grid.
 * Root notes get a different fill color and slightly larger radius.
 */
export function FretboardDots({
  positions,
  root,
  showNoteNames,
  startFret,
}: FretboardDotsProps) {
  return (
    <g data-testid="fretboard-dots">
      {positions.map((pos) => {
        const displayFret = pos.fret - startFret;
        if (displayFret < 0) return null;

        const cx = fretCenterX(displayFret);
        const cy = stringY(pos.string);
        const isRoot = root !== undefined && pos.note === root;
        const r = isRoot ? ROOT_DOT_RADIUS : DOT_RADIUS;

        return (
          <g key={`dot-${pos.string}-${pos.fret}`}>
            <circle
              cx={cx}
              cy={cy}
              r={r}
              fill={isRoot ? 'var(--fb-root, #e03131)' : 'var(--fb-dot, #228be6)'}
              stroke={isRoot ? 'var(--fb-root-stroke, #c92a2a)' : 'var(--fb-dot-stroke, #1971c2)'}
              strokeWidth={1.5}
            />
            {showNoteNames && (
              <text
                x={cx}
                y={cy}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={isRoot ? 11 : 10}
                fontWeight={isRoot ? 700 : 500}
                fill="white"
                style={{ pointerEvents: 'none', userSelect: 'none' }}
              >
                {pos.note}
              </text>
            )}
          </g>
        );
      })}
    </g>
  );
}
