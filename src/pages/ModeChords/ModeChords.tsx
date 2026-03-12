import { useState, useMemo } from 'react';
import { Title, Text, Select, Group, Stack, RangeSlider } from '@mantine/core';
import { SegmentedControl } from '@mantine/core';
import { getDiatonicChords } from '../../services/chords';
import { buildIntervalMap } from '../../services/intervals';
import { enharmonicDisplayLabel } from '../../services/notes';
import type { ChordVoicing } from '../../services/chordVoicing';
import { lookupVoicings, voicingFretSpan, findVoicingForRange } from '../../services/chordsDb';
import { ChordBox } from '../../components/chordbox';
import type { DotLabelMode } from '../../components/fretboard';
import styles from './ModeChords.module.css';

/**
 * Replace ASCII accidentals with unicode symbols for display.
 * e.g. 'F#' → 'F♯', 'Bb' → 'B♭'
 */
function formatNoteDisplay(pc: string): string {
  return pc.replace('#', '♯').replace(/([A-G])b$/, '$1♭');
}

/**
 * Build a chord label in the form "C maj", "D min", "B dim".
 */
function formatDiatonicLabel(root: string, type: string): string {
  const qualifier = type === 'major' ? 'maj' : type === 'minor' ? 'min' : 'dim';
  return `${formatNoteDisplay(root)} ${qualifier}`;
}

interface ChordRowItem {
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
): ChordRow[] {
  // Look up all curated voicings for each chord
  const allVoicings = diatonic.map((chord) => ({
    chord,
    intervalMap: buildIntervalMap(chord.notes, chord.intervals),
    voicings: lookupVoicings(chord.root, chord.type),
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

    const { baseFret: rowBaseFret, fretWindow } = findConsensusFretRange(spans);
    const rowHighFret = rowBaseFret + fretWindow - 1;

    // Build each chord item, finding the best-fitting voicing for the range
    const items: ChordRowItem[] = allVoicings.map(({ chord, intervalMap, voicings }) => {
      const natural = voicings[posIdx] ?? null;

      // Check if the natural voicing fits entirely in the row's fret range
      if (natural) {
        const span = voicingFretSpan(natural);
        if (!span || (span.minFret >= rowBaseFret && span.maxFret <= rowHighFret)) {
          return {
            chord,
            intervalMap,
            voicing: { ...natural, baseFret: rowBaseFret },
          };
        }
      }

      // Natural doesn't fit — search all positions for this chord
      const alt = findVoicingForRange(chord.root, chord.type, rowBaseFret, rowHighFret, posIdx);
      if (alt) {
        return {
          chord,
          intervalMap,
          voicing: clipVoicingToRange(alt, rowBaseFret, rowHighFret),
        };
      }

      return { chord, intervalMap, voicing: null };
    });

    const label = rowBaseFret === 1 ? 'Open position' : `Position ${rowBaseFret}`;
    rows.push({ posIdx, label, items, fretWindow });
  }

  // ── Synthetic rows beyond chords-db positions ──────────────────────────
  // Continue up the neck in ~4-fret steps from the last native row's end.
  if (rows.length > 0 && rows.length < MAX_ROWS) {
    const lastRow = rows[rows.length - 1];
    // Start the next synthetic row just above where the last native row ended
    let nextBase = (lastRow.items
      .filter((x) => x.voicing !== null)
      .reduce((mx, x) => {
        const span = voicingFretSpan(x.voicing!);
        return span ? Math.max(mx, span.maxFret) : mx;
      }, 0)) + 1;

    for (let synIdx = rows.length; synIdx < MAX_ROWS; synIdx++) {
      const fw = 4;
      const highFret = nextBase + fw - 1;

      const items: ChordRowItem[] = allVoicings.map(({ chord, intervalMap }) => {
        const v = findVoicingForRange(chord.root, chord.type, nextBase, highFret);
        if (v) {
          return {
            chord,
            intervalMap,
            voicing: clipVoicingToRange(v, nextBase, highFret),
          };
        }
        return { chord, intervalMap, voicing: null };
      });

      const hasAny = items.some((x) => x.voicing !== null);
      if (!hasAny) break;

      rows.push({ posIdx: synIdx, label: `Position ${nextBase}`, items, fretWindow: fw });
      nextBase = highFret + 1;
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
  initialRoot?: string;
  onRootChange?: (root: string) => void;
  initialRowRange?: [number, number];
  onRowRangeChange?: (range: [number, number]) => void;
}

export function ModeChords({ tuning, initialRoot, onRootChange, initialRowRange, onRowRangeChange }: ModeChordsProps) {
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
    const allRows = buildRows(diatonic);

    return {
      rows: allRows,
      rootDisplay: enharmonicDisplayLabel(root) ?? root,
    };
  }, [root]);

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

        <Stack gap={4} mb="lg">
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
        <Title order={3} mb="xs" className={styles.pageTitle}>
          {rootDisplay} Major — Diatonic Chords
        </Title>

        {rows.slice(rowRange[0] - 1, rowRange[1]).map((row, idx) => (
          <div
            key={row.posIdx}
            className={`${styles.rowSection}${idx === 3 ? ` ${styles.page2Start}` : ''}`}
          >
            {/* Repeat the page title at the top of the 2nd printed page */}
            {idx === 3 && (
              <Title order={3} mb="xs" className={styles.pageTitleContinued}>
                {rootDisplay} Major — Diatonic Chords (cont.)
              </Title>
            )}
            <p className={styles.rowHeader}>{row.label}</p>
            <div className={styles.chordsRow}>
              {row.items.map(({ chord, intervalMap, voicing }) => {
                if (!voicing) return null;
                return (
                  <div key={chord.root} className={styles.chordCard}>
                    <p className={styles.chordLabel} data-testid="mode-chord-label">
                      {formatDiatonicLabel(chord.root, chord.type)}
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
