import type { FretPosition } from '../../models/music';
import type { DotLabelMode } from './FretboardDots';
import type { FretboardOrientation } from './FretboardGrid';
import { svgWidth, svgHeight, svgWidth_v, svgHeight_v } from './fretboardLayout';
import { FretboardGrid } from './FretboardGrid';
import { FretboardDots } from './FretboardDots';
import { FretboardLabels } from './FretboardLabels';

export type { FretboardOrientation };

export interface FretboardDiagramProps {
  /** Open-string tuning, low to high (e.g. ["E2", "A2", "D3", "G3", "B3", "E4"]). */
  tuning: string[];
  /** Number of fret columns to display. */
  fretCount?: number;
  /** Starting fret (0 = show nut). Defaults to 0. */
  startFret?: number;
  /** Positions to highlight (e.g. scale or chord tones). */
  highlightedPositions?: FretPosition[];
  /** Root note pitch class for accent coloring (e.g. "C"). */
  root?: string;
  /** What to display inside dots: note name, interval label, or nothing. Defaults to 'note'. */
  labelMode?: DotLabelMode;
  /**
   * Map from pitch class to interval label (e.g. { C: 'R', E: '3', G: '5' }).
   * Only used when labelMode is 'interval'.
   */
  intervalMap?: Record<string, string>;
  /** Whether to draw strings horizontally (default) or vertically (neck pointing up). */
  orientation?: FretboardOrientation;

  // Legacy convenience prop — maps to labelMode internally
  /** @deprecated Use labelMode instead. */
  showNoteNames?: boolean;
}

/**
 * Complete fretboard diagram rendered as an inline SVG.
 *
 * Combines the grid (strings, frets, inlays), labels (string names, fret
 * numbers), and optional highlighted-note dots into a single diagram.
 *
 * The SVG sizes itself based on string count and fret count — no DOM
 * measurement or useEffect needed.
 */
export function FretboardDiagram({
  tuning,
  fretCount = 15,
  startFret = 0,
  highlightedPositions = [],
  root,
  labelMode: labelModeProp,
  intervalMap,
  orientation = 'horizontal',
  showNoteNames,
}: FretboardDiagramProps) {
  // Resolve labelMode: explicit prop wins, then legacy showNoteNames, then default 'note'
  const labelMode: DotLabelMode =
    labelModeProp ?? (showNoteNames === false ? 'none' : 'note');

  const stringCount = tuning.length;
  const width = orientation === 'horizontal' ? svgWidth(fretCount) : svgWidth_v(stringCount);
  const height = orientation === 'horizontal' ? svgHeight(stringCount) : svgHeight_v(fretCount);

  // Filter positions to only those visible in the current fret window.
  const visiblePositions = highlightedPositions.filter(
    startFret === 0
      ? (p) => p.fret >= 0 && p.fret <= fretCount
      : (p) => p.fret >= startFret && p.fret < startFret + fretCount,
  );

  return (
    <svg
      data-testid="fretboard-diagram"
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      xmlns="http://www.w3.org/2000/svg"
      style={{ fontFamily: 'system-ui, sans-serif', overflow: 'visible' }}
    >
      <FretboardGrid
        stringCount={stringCount}
        fretCount={fretCount}
        startFret={startFret}
        orientation={orientation}
      />
      <FretboardLabels
        tuning={tuning}
        fretCount={fretCount}
        startFret={startFret}
        orientation={orientation}
      />
      <FretboardDots
        positions={visiblePositions}
        root={root}
        labelMode={labelMode}
        intervalMap={intervalMap}
        startFret={startFret}
        stringCount={stringCount}
        orientation={orientation}
      />
    </svg>
  );
}
