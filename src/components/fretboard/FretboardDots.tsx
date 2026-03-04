import {
  fretCenterX,
  fretCenterY,
  stringY,
  stringX,
  STRING_LABEL_X,
  STRING_LABEL_TOP_Y,
  DOT_RADIUS,
  ROOT_DOT_RADIUS,
} from './fretboardLayout';
import type { FretPosition } from '../../models/music';
import type { FretboardOrientation } from './FretboardGrid';

export type DotLabelMode = 'note' | 'interval' | 'none';

interface FretboardDotsProps {
  /** Positions to highlight on the fretboard. */
  positions: FretPosition[];
  /** The root note pitch class (e.g. "C") — gets a distinct color. */
  root?: string;
  /** What to display inside each dot. Defaults to 'note'. */
  labelMode: DotLabelMode;
  /**
   * Map from pitch class to interval label (e.g. { C: 'R', E: '3', G: '5' }).
   * Only used when labelMode is 'interval'.
   */
  intervalMap?: Record<string, string>;
  /** Starting fret of the visible window (used to offset x positions). */
  startFret: number;
  /** Total number of strings — needed to compute inverted string Y positions. */
  stringCount: number;
  orientation?: FretboardOrientation;
}

/**
 * Renders highlighted note dots on the fretboard grid.
 * Root notes get a different fill color and slightly larger radius.
 */
export function FretboardDots({
  positions,
  root,
  labelMode,
  intervalMap,
  startFret,
  stringCount,
  orientation = 'horizontal',
}: FretboardDotsProps) {
  return (
    <g data-testid="fretboard-dots">
      {positions.map((pos) => {
        // When startFret === 0, fret 0 maps to the open-string column (displayFret 0).
        // When startFret > 0, shift by +1 so the first visible fret lands in
        // fret space 1 (not the open-string area to the left of the nut line).
        const displayFret = startFret === 0 ? pos.fret : pos.fret - startFret + 1;
        if (displayFret < 0) return null;

        // In horizontal mode: cx = fret center (X), cy = string (Y)
        // In vertical mode:   cx = string (X),     cy = fret center (Y)
        const cx =
          orientation === 'horizontal' ? fretCenterX(displayFret) : stringX(pos.string);
        const cy =
          orientation === 'horizontal'
            ? stringY(pos.string, stringCount)
            : fretCenterY(displayFret);
        const isRoot = root !== undefined && pos.note === root;
        const isOpen = pos.fret === 0;  // literal open string, not just left edge of viewport
        const r = isRoot ? ROOT_DOT_RADIUS : DOT_RADIUS;

        const rootColor = 'var(--fb-root, #e03131)';
        const rootStroke = 'var(--fb-root-stroke, #c92a2a)';
        const dotColor = 'var(--fb-dot, #228be6)';
        const dotStroke = 'var(--fb-dot-stroke, #1971c2)';

        let label: string | null = null;
        if (labelMode === 'note') {
          label = pos.note;
        } else if (labelMode === 'interval' && intervalMap) {
          label = intervalMap[pos.note] ?? pos.note;
        }

        // Open-string dots: hollow ring.
        // Horizontal: ring sits on STRING_LABEL_X (left of nut), same cy as the string.
        // Vertical: ring sits above the nut (STRING_LABEL_TOP_Y), same cx as the string.
        if (isOpen) {
          const openCx = orientation === 'horizontal' ? STRING_LABEL_X : cx;
          const openCy = orientation === 'horizontal' ? cy : STRING_LABEL_TOP_Y;
          return (
            <g key={`dot-${pos.string}-${pos.fret}`} data-open="true">
              <circle
                cx={openCx}
                cy={openCy}
                r={r}
                fill="none"
                stroke={isRoot ? rootColor : dotColor}
                strokeWidth={2}
              />
            </g>
          );
        }

        return (
          <g key={`dot-${pos.string}-${pos.fret}`}>
            <circle
              cx={cx}
              cy={cy}
              r={r}
              fill={isRoot ? rootColor : dotColor}
              stroke={isRoot ? rootStroke : dotStroke}
              strokeWidth={1.5}
            />
            {label && (
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
                {label}
              </text>
            )}
          </g>
        );
      })}
    </g>
  );
}
