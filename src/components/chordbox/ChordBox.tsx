import type { ChordVoicing } from '../../services/chordVoicing';
import { noteAtPosition } from '../../services/chordVoicing';
import type { DotLabelMode } from '../fretboard/FretboardDots';
import {
  CB_WIRE_WIDTH,
  CB_STRING_WIDTH,
  CB_NUT_HEIGHT,
  CB_DOT_RADIUS,
  CB_ROOT_DOT_RADIUS,
  cbWidth,
  cbHeight,
  cbStringX,
  cbGridTop,
  cbFretLineY,
  cbDotCY,
  cbIndicatorY,
} from './chordBoxLayout';

export interface ChordBoxProps {
  /** Computed chord voicing (one fret value per string). */
  voicing: ChordVoicing;
  /** Open-string notes low-to-high (e.g. ["E2","A2","D3","G3","B3","E4"]). */
  tuning: string[];
  /** How many fret rows to display. Default 4. */
  fretWindow?: number;
  /** Root pitch class — dots for the root note get a distinct colour. */
  root?: string;
  /** What to display inside dots. Default 'note'. */
  labelMode?: DotLabelMode;
  /**
   * Map from pitch class to interval label (e.g. { C: 'R', E: '3', G: '5' }).
   * Only used when labelMode is 'interval'.
   */
  intervalMap?: Record<string, string>;
  /** Optional chord name / label rendered above the diagram. */
  label?: string;
}

/**
 * A vertical guitar chord-box diagram rendered as an inline SVG.
 *
 * Strings run left-to-right (lowest on the left), frets top-to-bottom.
 * Muted strings show "✕", open strings show "○", fretted strings show a dot.
 */
export function ChordBox({
  voicing,
  tuning,
  fretWindow = 4,
  root,
  labelMode = 'note',
  intervalMap,
  label,
}: ChordBoxProps) {
  const stringCount = tuning.length;
  const width = cbWidth(stringCount);
  const height = cbHeight(fretWindow);
  const gridTop = cbGridTop();
  const gridBottom = cbFretLineY(fretWindow);

  const showNut = voicing.baseFret === 1;

  const rootColor = 'var(--cb-root, #e03131)';
  const rootStroke = 'var(--cb-root-stroke, #c92a2a)';
  const dotColor = 'var(--cb-dot, #228be6)';
  const dotStroke = 'var(--cb-dot-stroke, #1971c2)';
  const wireColor = 'var(--cb-wire, #999)';
  const stringColor = 'var(--cb-string, #999)';
  const textColor = 'var(--cb-text, #ccc)';
  const mutedColor = 'var(--cb-muted, #888)';
  const openColor = 'var(--cb-open, #aaa)';

  // ── Strings (vertical lines) ─────────────────────────────────────────────
  const stringLines = tuning.map((_, i) => (
    <line
      key={`str-${i}`}
      x1={cbStringX(i)}
      y1={gridTop}
      x2={cbStringX(i)}
      y2={gridBottom}
      stroke={stringColor}
      strokeWidth={CB_STRING_WIDTH}
    />
  ));

  // ── Fret wires / nut (horizontal lines) ──────────────────────────────────
  const leftX = cbStringX(0);
  const rightX = cbStringX(stringCount - 1);

  const fretLines = Array.from({ length: fretWindow + 1 }, (_, row) => {
    const y = cbFretLineY(row);
    const isNut = showNut && row === 0;
    if (isNut) {
      return (
        <rect
          key="nut"
          x={leftX}
          y={y}
          width={rightX - leftX}
          height={CB_NUT_HEIGHT}
          fill="var(--cb-nut, #e0e0e0)"
          data-testid="chord-box-nut"
        />
      );
    }
    return (
      <line
        key={`fret-${row}`}
        x1={leftX}
        y1={y}
        x2={rightX}
        y2={y}
        stroke={wireColor}
        strokeWidth={CB_WIRE_WIDTH}
      />
    );
  });

  // ── Position label (e.g. "5fr") ───────────────────────────────────────────
  // Placed on the LEFT side of the diagram, vertically centred in the first
  // fret space — the standard convention in most digital chord charts.
  // The number is the topmost (lowest-numbered) fret visible in the window.
  const positionLabel =
    voicing.baseFret > 1 ? (
      <text
        key="pos-label"
        x={cbStringX(0) - 4}
        y={cbDotCY(1)}
        fill={textColor}
        fontSize={10}
        textAnchor="end"
        dominantBaseline="middle"
        data-testid="chord-box-position"
      >
        {voicing.baseFret}fr
      </text>
    ) : null;

  // ── Per-string indicators and dots ───────────────────────────────────────
  const indicators: React.ReactElement[] = [];
  const dots: React.ReactElement[] = [];

  voicing.strings.forEach((fret, i) => {
    const cx = cbStringX(i);
    const iy = cbIndicatorY();
    const noteName = noteAtPosition(tuning[i], fret);
    const isRoot = root !== undefined && noteName === root;

    if (fret === null) {
      // Muted: draw ✕
      const d = 5;
      indicators.push(
        <g key={`ind-${i}`} data-testid={`chord-box-muted-${i}`}>
          <line
            x1={cx - d}
            y1={iy - d}
            x2={cx + d}
            y2={iy + d}
            stroke={mutedColor}
            strokeWidth={1.5}
          />
          <line
            x1={cx + d}
            y1={iy - d}
            x2={cx - d}
            y2={iy + d}
            stroke={mutedColor}
            strokeWidth={1.5}
          />
        </g>,
      );
      return;
    }

    if (fret === 0) {
      // Open: draw ○ with optional note/interval label
      let openLabel: string | null = null;
      if (labelMode === 'note' && noteName) {
        openLabel = noteName;
      } else if (labelMode === 'interval' && noteName && intervalMap) {
        openLabel = intervalMap[noteName] ?? noteName;
      }
      const openFontSize = openLabel && openLabel.length > 2 ? 7 : 8;
      indicators.push(
        <g key={`ind-${i}`} data-testid={`chord-box-open-${i}`}>
          <circle
            cx={cx}
            cy={iy}
            r={9}
            fill="none"
            stroke={openColor}
            strokeWidth={1.5}
          />
          {openLabel && (
            <text
              x={cx}
              y={iy + 0.5}
              textAnchor="middle"
              dominantBaseline="middle"
              fill={openColor}
              fontSize={openFontSize}
              fontWeight="600"
            >
              {openLabel}
            </text>
          )}
        </g>,
      );
      return;
    }

    // Fretted: draw a dot in the correct fret space
    const fretSpace = fret - voicing.baseFret + 1; // 1-based row in visible window
    if (fretSpace < 1 || fretSpace > fretWindow) return; // outside window

    const cy = cbDotCY(fretSpace);
    const r = isRoot ? CB_ROOT_DOT_RADIUS : CB_DOT_RADIUS;
    const fill = isRoot ? rootColor : dotColor;
    const stroke = isRoot ? rootStroke : dotStroke;

    let label: string | null = null;
    if (labelMode === 'note' && noteName) {
      label = noteName;
    } else if (labelMode === 'interval' && noteName && intervalMap) {
      label = intervalMap[noteName] ?? noteName;
    }

    const fontSize = label && label.length > 2 ? 7 : 8;

    dots.push(
      <g key={`dot-${i}`} data-testid={`chord-box-dot-${i}`}>
        <circle cx={cx} cy={cy} r={r} fill={fill} stroke={stroke} strokeWidth={1} />
        {label && (
          <text
            x={cx}
            y={cy + 1}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="#fff"
            fontSize={fontSize}
            fontWeight="bold"
          >
            {label}
          </text>
        )}
      </g>,
    );
  });

  // ── Optional chord label ──────────────────────────────────────────────────
  const chordLabel = label ? (
    <text
      x={width / 2}
      y={4}
      fill={textColor}
      fontSize={11}
      fontWeight="600"
      textAnchor="middle"
      dominantBaseline="hanging"
      data-testid="chord-box-label"
    >
      {label}
    </text>
  ) : null;

  return (
    <svg
      data-testid="chord-box"
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      xmlns="http://www.w3.org/2000/svg"
      style={{ fontFamily: 'system-ui, sans-serif', overflow: 'visible' }}
    >
      {chordLabel}
      {fretLines}
      {stringLines}
      {positionLabel}
      {indicators}
      {dots}
    </svg>
  );
}
