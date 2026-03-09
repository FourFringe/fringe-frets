import { useState, useMemo } from 'react';
import { Title, Text, Select, Group, Stack, RangeSlider } from '@mantine/core';
import { SegmentedControl } from '@mantine/core';
import { Note } from 'tonal';
import { getDiatonicChords } from '../../services/chords';
import { buildIntervalMap } from '../../services/intervals';
import { enharmonicDisplayLabel } from '../../services/notes';
import { findVoicingInWindow } from '../../services/chordVoicing';
import type { ChordVoicing } from '../../services/chordVoicing';
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

/**
 * Mute contiguous open strings at the bottom of the chord that are not the
 * chord root.  Stops as soon as it encounters the root or a fretted string.
 * This prevents non-root bass notes (e.g. E on low-E for a C chord) from
 * showing as playable open strings.
 */
function muteOpenNonRootStrings(
  voicing: ChordVoicing,
  chordRoot: string,
  tuning: string[],
): ChordVoicing {
  const newStrings = [...voicing.strings];
  for (let i = 0; i < newStrings.length; i++) {
    if (newStrings[i] !== 0) break; // fretted or already muted — stop
    const openPc = Note.get(tuning[i]).pc;
    if (openPc === chordRoot) break; // root string — keep and stop
    newStrings[i] = null; // non-root open — mute
  }
  return { ...voicing, strings: newStrings };
}

interface ChordRowItem {
  chord: ReturnType<typeof getDiatonicChords>[number];
  intervalMap: Record<string, string>;
  voicing: ChordVoicing | null;
}

interface ChordRow {
  label: string;
  items: ChordRowItem[];
  fretWindow: number;
  /** The lowest fret shown — next row should search from here + fretWindow. */
  searchEnd: number;
}

/**
 * Build one row of 7 chord voicings, normalised to a shared fret window.
 * Searches for each chord's lowest voicing whose baseFret >= searchFrom.
 * Returns the row data plus where the next search should start.
 */
function buildClosedRow(
  diatonic: ReturnType<typeof getDiatonicChords>,
  tuning: string[],
  searchFrom: number,
): ChordRow {
  const raw = diatonic.map((chord) => {
    const intervalMap = buildIntervalMap(chord.notes, chord.intervals);
    let voicing: ChordVoicing | null = null;
    for (let start = searchFrom; start <= 20 && voicing === null; start++) {
      voicing = findVoicingInWindow(chord.notes, tuning, start, 4);
    }
    return { chord, intervalMap, voicing };
  });

  const valid = raw.filter((x) => x.voicing !== null);
  const sharedBase =
    valid.length > 0 ? Math.min(...valid.map((x) => x.voicing!.baseFret)) : searchFrom;
  const maxFret =
    valid.length > 0
      ? Math.max(
          ...valid.flatMap((x) =>
            x.voicing!.strings.filter((f): f is number => f !== null && f > 0),
          ),
        )
      : sharedBase + 3;
  const fretWindow = Math.max(4, maxFret - sharedBase + 1);

  const items = raw.map((item) => ({
    ...item,
    voicing: item.voicing ? { ...item.voicing, baseFret: sharedBase } : null,
  }));

  return {
    label: `Position ${sharedBase}`,
    items,
    fretWindow,
    searchEnd: sharedBase + fretWindow,
  };
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

    // ── Row 1: open position ──────────────────────────────────────────────────
    const openItems = diatonic.map((chord) => {
      const intervalMap = buildIntervalMap(chord.notes, chord.intervals);
      const raw = findVoicingInWindow(chord.notes, tuning, 1, 4);
      const voicing = raw ? muteOpenNonRootStrings(raw, chord.root, tuning) : null;
      return { chord, intervalMap, voicing };
    });
    const openRow = { label: 'Open position', items: openItems, fretWindow: 4, searchEnd: 2 };

    // ── Rows 2-6: successive closed positions ─────────────────────────────────
    // Each row starts searching from where the previous row's window ended so
    // the voicings march up the neck without overlapping.
    const closedRows: ChordRow[] = [];
    let nextSearch = openRow.searchEnd;
    for (let i = 0; i < 5; i++) {
      const row = buildClosedRow(diatonic, tuning, nextSearch);
      closedRows.push(row);
      nextSearch = row.searchEnd;
    }

    return {
      rows: [openRow, ...closedRows],
      rootDisplay: enharmonicDisplayLabel(root) ?? root,
    };
  }, [root, tuning]);

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
            max={6}
            minRange={1}
            step={1}
            w={200}
            marks={[
              { value: 1, label: '1' },
              { value: 2, label: '2' },
              { value: 3, label: '3' },
              { value: 4, label: '4' },
              { value: 5, label: '5' },
              { value: 6, label: '6' },
            ]}
          />
        </Stack>
      </div>

      {/* Printable content */}
      <div className={styles.printContent}>
        <Title order={3} mb="xs" className={styles.pageTitle}>
          {rootDisplay} Major — Diatonic Chords
        </Title>

        {rows.slice(rowRange[0] - 1, rowRange[1]).map((row) => (
          <div key={row.label} className={styles.rowSection}>
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
