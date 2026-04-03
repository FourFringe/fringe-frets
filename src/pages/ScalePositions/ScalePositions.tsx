import { useState, useMemo } from 'react';
import {
  Title,
  Text,
  Select,
  Group,
  Stack,
  SegmentedControl,
} from '@mantine/core';
import { getScale } from '../../services/scales';
import { buildIntervalMap } from '../../services/intervals';
import { enharmonicDisplayLabel } from '../../services/notes';
import { buildFretboard, filterByPitchClasses } from '../../services/fretboard';
import { findScalePositions } from '../../services/scalePositions';
import { ScaleNoteList } from '../../components/ScaleNoteList';
import { FretboardDiagram } from '../../components/fretboard';
import type { DotLabelMode } from '../../components/fretboard';
import styles from './ScalePositions.module.css';

const MODES = [
  { numeral: 'I',   name: 'Ionian',     type: 'ionian' },
  { numeral: 'II',  name: 'Dorian',     type: 'dorian' },
  { numeral: 'III', name: 'Phrygian',   type: 'phrygian' },
  { numeral: 'IV',  name: 'Lydian',     type: 'lydian' },
  { numeral: 'V',   name: 'Mixolydian', type: 'mixolydian' },
  { numeral: 'VI',  name: 'Aeolian',    type: 'aeolian' },
  { numeral: 'VII', name: 'Locrian',    type: 'locrian' },
];

const ROOT_NOTES = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];
const rootOptions = ROOT_NOTES.map((n) => ({
  value: n,
  label: enharmonicDisplayLabel(n) ?? n,
}));

const modeOptions = MODES.map((m) => ({
  value: m.type,
  label: `${m.numeral} ${m.name}`,
}));

const MAX_FRET = 15;
const WINDOW_SIZE = 4;
const MAX_POSITIONS = 6;

interface ScalePositionsProps {
  tuning: string[];
}

export function ScalePositions({ tuning }: ScalePositionsProps) {
  const [root, setRoot] = useState('C');
  const [mode, setMode] = useState('ionian');
  const [labelMode, setLabelMode] = useState<DotLabelMode>('note');

  const { scaleName, scaleNotes, scaleIntervals, intervalMap, highlightedPositions, positions } =
    useMemo(() => {
      const scaleInfo = getScale(root, mode);
      const notes = scaleInfo?.notes ?? [];
      const intervals = scaleInfo?.intervals ?? [];
      const iMap = buildIntervalMap(notes, intervals);

      const fretboard = buildFretboard(tuning, MAX_FRET);
      const highlighted = notes.length > 0 ? filterByPitchClasses(fretboard, notes) : [];

      const allPositions = findScalePositions(tuning, notes, MAX_FRET, WINDOW_SIZE);
      const positions = allPositions.slice(0, MAX_POSITIONS);

      return {
        scaleName: scaleInfo?.name ?? `${root} ${mode}`,
        scaleNotes: notes,
        scaleIntervals: intervals,
        intervalMap: iMap,
        highlightedPositions: highlighted,
        positions,
      };
    }, [root, mode, tuning]);

  return (
    <div>
      <div className={styles.printHide}>
        <Title order={1} mb="xs">
          Scale Positions
        </Title>
        <Text c="dimmed" mb="xl">
          Practice a scale across different fret positions. Each diagram shows the same
          scale within a narrow fret window.
        </Text>

        <Group mb="lg">
          <Select
            label="Root"
            data={rootOptions}
            value={root}
            onChange={(v) => v && setRoot(v)}
            w={120}
          />
          <Select
            label="Mode"
            data={modeOptions}
            value={mode}
            onChange={(v) => v && setMode(v)}
            w={180}
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

      <div className={styles.printContent}>
        <Title order={3} mb="xs" className={styles.pageTitle}>
          {scaleName}
        </Title>
        <Text size="sm" c="dimmed" mb="md">
          <ScaleNoteList notes={scaleNotes} intervals={scaleIntervals} intervalMap={intervalMap} />
        </Text>

        {positions.length === 0 ? (
          <Text c="dimmed">No {WINDOW_SIZE}-fret positions found for this scale.</Text>
        ) : (
          <div className={styles.positionsGrid}>
            {positions.map((startFret) => {
              // Core window is WINDOW_SIZE frets; extend 1 fret above to
              // capture scale notes that spill over on individual strings.
              const raw = highlightedPositions.filter(
                (p) => p.fret >= startFret && p.fret <= startFret + WINDOW_SIZE,
              );

              // Deduplicate by MIDI pitch: when the same note appears on two
              // strings (e.g. F4 on both G-string fret 10 and B-string fret 6),
              // keep the one on the lower string for a natural ascending pattern.
              const seenMidi = new Map<number, number>();
              for (const p of raw) {
                const prev = seenMidi.get(p.midi);
                if (prev === undefined || p.string < prev) {
                  seenMidi.set(p.midi, p.string);
                }
              }
              const windowPositions = raw.filter(
                (p) => seenMidi.get(p.midi) === p.string,
              );

              const lowestFret = windowPositions.length > 0
                ? Math.min(...windowPositions.map((p) => p.fret))
                : startFret;

              return (
                <div key={startFret} className={styles.positionCard}>
                  <Text size="xs" fw={600} mb={4} className={styles.positionLabel}>
                    Fret {lowestFret}
                  </Text>
                  <FretboardDiagram
                    tuning={tuning}
                    fretCount={MAX_FRET}
                    startFret={0}
                    highlightedPositions={windowPositions}
                    root={root}
                    labelMode={labelMode}
                    intervalMap={intervalMap}
                    orientation="vertical"
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
