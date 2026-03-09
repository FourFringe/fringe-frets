import { useState, useMemo } from 'react';
import { Title, Text, Select, Group, Stack } from '@mantine/core';
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

  function setRoot(r: string) {
    setRootState(r);
    onRootChange?.(r);
  }

  /** Compute the 7 diatonic chords + open-position voicings. */
  const chordsWithVoicings = useMemo(() => {
    const diatonic = getDiatonicChords(root);
    return diatonic.map((chord) => {
      const intervalMap = buildIntervalMap(chord.notes, chord.intervals);
      const rawVoicing = findVoicingInWindow(chord.notes, tuning, 1, 4);
      const voicing = rawVoicing
        ? muteOpenNonRootStrings(rawVoicing, chord.root, tuning)
        : null;
      return { chord, intervalMap, voicing };
    });
  }, [root, tuning]);

  const rootDisplay = enharmonicDisplayLabel(root) ?? root;

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
      </div>

      {/* Printable content */}
      <div className={styles.printContent}>
        <Title order={3} mb="xs" className={styles.pageTitle}>
          {rootDisplay} Major — Diatonic Chords
        </Title>

        <div className={styles.chordsRow}>
          {chordsWithVoicings.map(({ chord, intervalMap, voicing }) => {
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
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
