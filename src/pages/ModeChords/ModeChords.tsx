import { useState, useMemo } from 'react';
import { Title, Text, Select, Group, Stack, RangeSlider } from '@mantine/core';
import { SegmentedControl } from '@mantine/core';
import { getDiatonicChords } from '../../services/chords';
import { buildIntervalMap } from '../../services/intervals';
import { enharmonicDisplayLabel } from '../../services/notes';
import type { ChordVoicing } from '../../services/chordVoicing';
import { lookupVoicings } from '../../services/chordsDb';
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
 * Build all rows of chord voicings from the chords-db curated positions.
 *
 * Each chord in chords-db typically has 4 positions at different neck locations.
 * We group them into rows by position index (0 = first/open, 1 = second, etc.),
 * then compute a shared baseFret and dynamic fret window per row so all 7
 * chord diagrams in a row align visually.
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

  for (let posIdx = 0; posIdx < maxPositions; posIdx++) {
    // Pick the posIdx-th voicing for each chord (or null if fewer positions).
    // Each voicing keeps its own baseFret so ChordBox can independently show
    // the nut (baseFret 1) or a position label (baseFret > 1).
    const items: ChordRowItem[] = allVoicings.map(({ chord, intervalMap, voicings }) => ({
      chord,
      intervalMap,
      voicing: voicings[posIdx] ?? null,
    }));

    const valid = items.filter((x) => x.voicing !== null);
    if (valid.length === 0) continue;

    // Compute a shared fretWindow so all diagrams in the row are the same
    // height.  Each voicing's span is relative to its own baseFret.
    const perVoicingSpans = valid.map((x) => {
      const v = x.voicing!;
      const fretted = v.strings.filter((f): f is number => f !== null && f > 0);
      if (fretted.length === 0) return 4; // all-open chord — 4 frets is fine
      const maxFret = Math.max(...fretted);
      return maxFret - v.baseFret + 1;
    });
    const fretWindow = Math.max(4, ...perVoicingSpans);

    // Row label is based on the lowest baseFret across all voicings
    const minBase = Math.min(...valid.map((x) => x.voicing!.baseFret));
    const label = minBase === 1
      ? 'Open position'
      : `Position ${minBase}`;

    rows.push({ posIdx, label, items, fretWindow });
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

interface ModeChordsProps {
  tuning: string[];
  initialRoot?: string;
  onRootChange?: (root: string) => void;
}

export function ModeChords({ tuning, initialRoot, onRootChange }: ModeChordsProps) {
  const [root, setRootState] = useState(initialRoot ?? 'C');
  const [labelMode, setLabelMode] = useState<DotLabelMode>('note');
  const [rowRange, setRowRange] = useState<[number, number]>([1, 3]);

  function setRoot(r: string) {
    setRootState(r);
    onRootChange?.(r);
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
            max={Math.max(rows.length, 1)}
            minRange={1}
            step={1}
            w={200}
            marks={rows.map((_, i) => ({ value: i + 1, label: String(i + 1) }))}
          />
        </Stack>
      </div>

      {/* Printable content */}
      <div className={styles.printContent}>
        <Title order={3} mb="xs" className={styles.pageTitle}>
          {rootDisplay} Major — Diatonic Chords
        </Title>

        {rows.slice(rowRange[0] - 1, rowRange[1]).map((row) => (
          <div key={row.posIdx} className={styles.rowSection}>
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
