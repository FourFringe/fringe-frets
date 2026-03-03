import { fretCenterX, stringY, DOT_RADIUS, ROOT_DOT_RADIUS } from './fretboardLayout';
import type { FretPosition } from '../../models/music';

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
}: FretboardDotsProps) {
  return (
    <g data-testid="fretboard-dots">
      {positions.map((pos) => {
        const displayFret = pos.fret - startFret;
        if (displayFret < 0) return null;

        const cx = fretCenterX(displayFret);
        const cy = stringY(pos.string);
        const isRoot = root !== undefined && pos.note === root;
        const isOpen = displayFret === 0;
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

        // Open-string dots are rendered as hollow (outline) circles
        if (isOpen) {
          return (
            <g key={`dot-${pos.string}-${pos.fret}`} data-open="true">
              <circle
                cx={cx}
                cy={cy}
                r={r}
                fill="none"
                stroke={isRoot ? rootColor : dotColor}
                strokeWidth={2}
              />
              {label && (
                <text
                  x={cx}
                  y={cy}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={isRoot ? 11 : 10}
                  fontWeight={isRoot ? 700 : 500}
                  fill={isRoot ? rootColor : dotColor}
                  style={{ pointerEvents: 'none', userSelect: 'none' }}
                >
                  {label}
                </text>
              )}
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
