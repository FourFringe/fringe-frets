import { useState, useMemo } from 'react';
import { Title, Text, Select, Group, Stack, RangeSlider } from '@mantine/core';
import { SegmentedControl } from '@mantine/core';
import { getDiatonicChords } from '../../services/chords';
import { buildIntervalMap } from '../../services/intervals';
import { enharmonicDisplayLabel } from '../../services/notes';
import type { ChordVoicing } from '../../services/chordVoicing';
import { findVoicingInWindow } from '../../services/chordVoicing';
import { lookupVoicings, voicingFretSpan, findVoicingForRange } from '../../services/chordsDb';
import { ChordBox } from '../../components/chordbox';
import type { DotLabelMode } from '../../components/fretboard';
import { INSTRUMENTS, CHORD_INSTRUMENT_IDS } from '../../models/instrument';
import styles from './ModeChords.module.css';

/**
 * Replace ASCII accidentals with unicode symbols for display.
 * e.g. 'F#' → 'F♯', 'Bb' → 'B♭'
 */
function formatNoteDisplay(pc: string): string {
  return pc.replace('#', '♯').replace(/([A-G])b$/, '$1♭');
}

const ROMAN_NUMERALS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];

/**
 * Build a chord label in the form "I – C maj", "II – D min", "VII – B dim".
 */
function formatDiatonicLabel(degree: number, root: string, type: string): string {
  const qualifier = type === 'major' ? 'maj' : type === 'minor' ? 'min' : 'dim';
  return `${ROMAN_NUMERALS[degree]}. (${formatNoteDisplay(root)} ${qualifier})`;
}

interface ChordRowItem {
  degree: number;
  chord: ReturnType<typeof getDiatonicChords>[number];
  intervalMap: Record<string, string>;
  voicing: ChordVoicing | null;
}

interface ChordRow {
  posIdx: number;
  label: string;
  items: ChordRowItem[];
  fretWindow: number;
}

/**
 * Determine a shared baseFret and fretWindow for a row of voicings.
 *
 * Tries fretWindows of 4 and 5, and every candidate baseFret, picking the
 * combination that fits (all fretted notes within range) the most voicings.
 * Ties prefer the narrower window, then the lower baseFret.
 */
function findConsensusFretRange(
  spans: { minFret: number; maxFret: number }[],
): { baseFret: number; fretWindow: number } {
  if (spans.length === 0) return { baseFret: 1, fretWindow: 4 };

  const minFrets = spans.map((s) => s.minFret);
  const lo = Math.min(...minFrets);
  const hi = Math.max(...minFrets);

  let bestBase = lo;
  let bestCount = 0;
  let bestWindow = 4;

  for (const fw of [4, 5]) {
    for (let base = lo; base <= hi; base++) {
      const top = base + fw - 1;
      const count = spans.filter((s) => s.minFret >= base && s.maxFret <= top).length;
      if (count > bestCount || (count === bestCount && fw < bestWindow)) {
        bestBase = base;
        bestCount = count;
        bestWindow = fw;
      }
    }
  }

  return { baseFret: bestBase, fretWindow: bestWindow };
}

/**
 * Clip a voicing to a fret range: any fretted note outside [lowFret, highFret]
 * is muted.  Open strings and already-muted strings are left unchanged.
 * baseFret is set to `lowFret` so the diagram aligns with the row.
 */
function clipVoicingToRange(
  voicing: ChordVoicing,
  lowFret: number,
  highFret: number,
): ChordVoicing {
  return {
    baseFret: lowFret,
    strings: voicing.strings.map((f) => {
      if (f === null || f === 0) return f;
      if (f >= lowFret && f <= highFret) return f;
      return null;
    }),
  };
}

/**
 * Build rows using the algorithmic voicing engine for instruments without
 * curated chords-db data (bass, mandolin, violin, cello, etc.).
 *
 * Generates voicings at several fret windows across the neck, grouped
 * into rows with a shared fret range — mirroring the curated layout.
 */
function buildAlgorithmicRows(
  diatonic: ReturnType<typeof getDiatonicChords>,
  tuning: string[],
): ChordRow[] {
  // Minimum strings that must sound to count as a usable voicing.
  const minStrings = Math.min(tuning.length, 3);

  const windowSize = 4;
  const rows: ChordRow[] = [];

  for (let start = 1; start <= 12 && rows.length < MAX_ROWS; start++) {
    const items: ChordRowItem[] = diatonic.map((chord, degree) => {
      const intervalMap = buildIntervalMap(chord.notes, chord.intervals);
      const voicing = findVoicingInWindow(chord.notes, tuning, start, windowSize);

      // Reject voicings with too few sounding strings
      if (voicing) {
        const active = voicing.strings.filter((f) => f !== null).length;
        if (active < minStrings) return { degree, chord, intervalMap, voicing: null };
      }

      return { degree, chord, intervalMap, voicing };
    });

    // Only include the row if at least one chord produced a valid voicing
    const hasAny = items.some((x) => x.voicing !== null);
    if (!hasAny) continue;

    const label = start === 1 ? 'Open position' : `Position ${start}`;
    rows.push({ posIdx: rows.length, label, items, fretWindow: windowSize });
  }

  return rows;
}

/**
 * Build all rows of chord voicings from the chords-db curated positions.
 *
 * Each chord in chords-db typically has 4 positions at different neck locations.
 * We group them into rows by position index (0 = first/open, 1 = second, etc.),
 * then compute a *shared* baseFret and fretWindow for the entire row so every
 * chord diagram displays the same fret range — making it easy to see how the
 * chords relate spatially on the neck.
 *
 * When a chord's natural voicing at a given posIdx doesn't fit the consensus
 * fret range, we search the chord's other curated positions for one that does.
 * If no position fits perfectly, the best partial match is clipped (out-of-range
 * notes are muted).
 */
function buildRows(
  diatonic: ReturnType<typeof getDiatonicChords>,
  instrumentId: string,
  tuning: string[],
): ChordRow[] {
  const hasCuratedDb = instrumentId === 'guitar';

  if (!hasCuratedDb) {
    return buildAlgorithmicRows(diatonic, tuning);
  }

  // Look up all curated voicings for each chord
  const allVoicings = diatonic.map((chord) => ({
    chord,
    intervalMap: buildIntervalMap(chord.notes, chord.intervals),
    voicings: lookupVoicings(chord.root, chord.type, instrumentId),
  }));

  // Determine the max number of positions any chord has
  const maxPositions = Math.max(...allVoicings.map((v) => v.voicings.length), 0);
  if (maxPositions === 0) return [];

  const rows: ChordRow[] = [];

  // ── Native chords-db rows ──────────────────────────────────────────────
  for (let posIdx = 0; posIdx < maxPositions; posIdx++) {
    // Gather natural voicings at this position index
    const naturalVoicings = allVoicings.map(({ voicings }) => voicings[posIdx] ?? null);
    const validVoicings = naturalVoicings.filter((v): v is ChordVoicing => v !== null);

    if (validVoicings.length === 0) continue;

    // Compute fret spans (fretted notes only) for the consensus calculation
    const spans = validVoicings
      .map((v) => voicingFretSpan(v))
      .filter((s): s is { minFret: number; maxFret: number } => s !== null);

    // Row 1 (posIdx 0) always shows the open position / nut.
    const consensus = findConsensusFretRange(spans);
    const rowBaseFret = posIdx === 0 ? 1 : consensus.baseFret;
    // When forcing baseFret=1, expand fretWindow to still cover the consensus range.
    const consensusHigh = consensus.baseFret + consensus.fretWindow - 1;
    const fretWindow = Math.max(consensus.fretWindow, consensusHigh - rowBaseFret + 1);
    const rowHighFret = rowBaseFret + fretWindow - 1;

    // Build each chord item, finding the best-fitting voicing for the range
    const items: ChordRowItem[] = allVoicings.map(({ chord, intervalMap, voicings }, degree) => {
      const natural = voicings[posIdx] ?? null;

      // Check if the natural voicing fits entirely in the row's fret range
      if (natural) {
        const span = voicingFretSpan(natural);
        if (!span || (span.minFret >= rowBaseFret && span.maxFret <= rowHighFret)) {
          return {
            degree,
            chord,
            intervalMap,
            voicing: { ...natural, baseFret: rowBaseFret },
          };
        }
      }

      // Natural doesn't fit — search all positions for this chord
      const alt = findVoicingForRange(chord.root, chord.type, rowBaseFret, rowHighFret, posIdx, instrumentId);
      if (alt) {
        return {
          degree,
          chord,
          intervalMap,
          voicing: clipVoicingToRange(alt, rowBaseFret, rowHighFret),
        };
      }

      return { degree, chord, intervalMap, voicing: null };
    });

    const label = rowBaseFret === 1 ? 'Open position' : `Position ${rowBaseFret}`;
    rows.push({ posIdx, label, items, fretWindow });
  }

  // ── Synthetic rows beyond chords-db positions ──────────────────────────
  // Reuse the native row baseFrets shifted up an octave (+12) so chord
  // shapes repeat naturally.  This avoids dead-fret gaps near fret 12.
  if (rows.length > 0 && rows.length < MAX_ROWS) {
    for (let synIdx = rows.length; synIdx < MAX_ROWS; synIdx++) {
      // Map back to the corresponding native row and shift +12
      const nativeRow = rows[synIdx - maxPositions];
      if (!nativeRow) break;

      // Derive the baseFret from the native row label
      const nativeBase = nativeRow.items
        .filter((x) => x.voicing !== null)
        .reduce((lo, x) => Math.min(lo, x.voicing!.baseFret), Infinity);
      // Open position (baseFret 1) includes open strings (fret 0) which shift
      // to fret 12, so the octave row should start at 12, not 13.
      const synBase = nativeBase === 1 ? 12 : (nativeBase === Infinity ? 13 : nativeBase + 12);
      const fw = nativeRow.fretWindow;
      const highFret = synBase + fw - 1;

      const items: ChordRowItem[] = allVoicings.map(({ chord, intervalMap }, degree) => {
        const v = findVoicingForRange(chord.root, chord.type, synBase, highFret, undefined, instrumentId);
        if (v) {
          return {
            degree,
            chord,
            intervalMap,
            voicing: clipVoicingToRange(v, synBase, highFret),
          };
        }
        return { degree, chord, intervalMap, voicing: null };
      });

      const hasAny = items.some((x) => x.voicing !== null);
      if (!hasAny) break;

      rows.push({ posIdx: synIdx, label: `Position ${synBase}`, items, fretWindow: fw });
    }
  }

  return rows;
}

/** All 12 pitch classes as roots.
 *  Eb, Ab, Bb are used instead of D#, G#, A# to avoid double-sharps. */
const ROOT_NOTES = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];
const rootOptions = ROOT_NOTES.map((n) => ({
  value: n,
  label: `${enharmonicDisplayLabel(n) ?? n} Major`,
}));

/** Maximum number of rows the slider supports (2 printed pages × 3 rows). */
const MAX_ROWS = 6;

interface ModeChordsProps {
  tuning: string[];
  instrumentId?: string;
  initialRoot?: string;
  onRootChange?: (root: string) => void;
  initialRowRange?: [number, number];
  onRowRangeChange?: (range: [number, number]) => void;
}

export function ModeChords({ tuning, instrumentId = 'guitar', initialRoot, onRootChange, initialRowRange, onRowRangeChange }: ModeChordsProps) {
  const instrumentName = INSTRUMENTS[instrumentId]?.name ?? instrumentId;

  if (!CHORD_INSTRUMENT_IDS.has(instrumentId)) {
    return (
      <div>
        <Title order={1} mb="xs">
          Mode Chords
        </Title>
        <Text c="dimmed" mt="md">
          Chord voicings are not available for {instrumentName}. Try the Scale Explorer or Mode Scales pages instead.
        </Text>
      </div>
    );
  }

  return (
    <ModeChordsInner
      tuning={tuning}
      instrumentId={instrumentId}
      initialRoot={initialRoot}
      onRootChange={onRootChange}
      initialRowRange={initialRowRange}
      onRowRangeChange={onRowRangeChange}
    />
  );
}

function ModeChordsInner({ tuning, instrumentId = 'guitar', initialRoot, onRootChange, initialRowRange, onRowRangeChange }: ModeChordsProps) {
  const [root, setRootState] = useState(initialRoot ?? 'C');
  const [labelMode, setLabelMode] = useState<DotLabelMode>('note');
  const [rowRange, setRowRangeState] = useState<[number, number]>(initialRowRange ?? [1, 3]);

  function setRoot(r: string) {
    setRootState(r);
    onRootChange?.(r);
  }

  function setRowRange(range: [number, number]) {
    setRowRangeState(range);
    onRowRangeChange?.(range);
  }

  const { rows, rootDisplay } = useMemo(() => {
    const diatonic = getDiatonicChords(root);
    const allRows = buildRows(diatonic, instrumentId, tuning);

    return {
      rows: allRows,
      rootDisplay: enharmonicDisplayLabel(root) ?? root,
    };
  }, [root, instrumentId, tuning]);

  return (
    <div>
      {/* Controls — hidden in print */}
      <div className={styles.printHide}>
        <Title order={1} mb="xs">
          Mode Chords
        </Title>
        <Text c="dimmed" mb="xl">
          The seven diatonic triads of a major scale.
        </Text>

        <Group mb="lg">
          <Select
            label="Major Scale"
            data={rootOptions}
            value={root}
            onChange={(v) => v && setRoot(v)}
            w={160}
          />
          <Stack gap={4}>
            <Text size="sm" fw={500}>
              Dot Labels
            </Text>
            <SegmentedControl
              value={labelMode}
              onChange={(v) => setLabelMode(v as DotLabelMode)}
              data={[
                { label: 'Notes', value: 'note' },
                { label: 'Intervals', value: 'interval' },
                { label: 'None', value: 'none' },
              ]}
              size="xs"
            />
          </Stack>
        </Group>

        <Stack gap={4} mb="xl">
          <Text size="sm" fw={500}>
            Rows: {rowRange[0]}–{rowRange[1]}
          </Text>
          <RangeSlider
            value={rowRange}
            onChange={setRowRange}
            min={1}
            max={MAX_ROWS}
            minRange={1}
            step={1}
            w={200}
            marks={Array.from({ length: MAX_ROWS }, (_, i) => ({ value: i + 1, label: String(i + 1) }))}
          />
        </Stack>
      </div>

      {/* Printable content */}
      <div className={styles.printContent}>
        <Title order={3} mb="md" className={styles.pageTitle}>
          {rootDisplay} Major — Diatonic Chords
        </Title>

        {rows.slice(rowRange[0] - 1, rowRange[1]).map((row, idx) => (
          <div
            key={row.posIdx}
            className={styles.rowSection}
          >
            {/* Repeat the page title at the top of the 2nd printed page */}
            {idx === 3 && (
              <Title order={3} mb="xs" className={`${styles.pageTitleContinued} ${styles.page2Start}`}>
                {rootDisplay} Major — Diatonic Chords (cont.)
              </Title>
            )}
            {/* Row header — one cell per column for swim lane continuity */}
            {row.items.map(({ degree }, i) => (
              <div
                key={`hdr-${i}`}
                className={`${styles.rowHeaderCell}${degree % 2 === 1 ? ` ${styles.chordCardEven}` : ''}`}
              >
                {i === 0 && <span className={styles.rowHeaderText}>{row.label}</span>}
              </div>
            ))}
            <div className={styles.chordsRow}>
              {row.items.map(({ degree, chord, intervalMap, voicing }) => {
                const cardClass = degree % 2 === 1
                  ? `${styles.chordCard} ${styles.chordCardEven}`
                  : styles.chordCard;
                if (!voicing) return <div key={chord.root} className={cardClass} />;
                return (
                  <div key={chord.root} className={cardClass}>
                    <p className={styles.chordLabel} data-testid="mode-chord-label">
                      {formatDiatonicLabel(degree, chord.root, chord.type)}
                    </p>
                    <ChordBox
                      voicing={voicing}
                      tuning={tuning}
                      root={chord.root}
                      labelMode={labelMode}
                      intervalMap={intervalMap}
                      fretWindow={row.fretWindow}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
