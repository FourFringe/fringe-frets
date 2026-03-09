import { useState, useMemo } from 'react';
import {
  Title,
  Text,
  Select,
  Group,
  RangeSlider,
  Stack,
  SegmentedControl,
} from '@mantine/core';
import { getScale } from '../../services/scales';
import { buildIntervalMap } from '../../services/intervals';
import { enharmonicDisplayLabel } from '../../services/notes';
import { ScaleNoteList } from '../../components/ScaleNoteList';
import { buildFretboard, filterByPitchClasses } from '../../services/fretboard';
import { FretboardDiagram } from '../../components/fretboard';
import type { DotLabelMode } from '../../components/fretboard';
import styles from './ScaleModes.module.css';

/** The seven modes of the major scale in order. */
const MODES = [
  { name: 'Ionian',      type: 'ionian'      },
  { name: 'Dorian',      type: 'dorian'      },
  { name: 'Phrygian',    type: 'phrygian'    },
  { name: 'Lydian',      type: 'lydian'      },
  { name: 'Mixolydian',  type: 'mixolydian'  },
  { name: 'Aeolian',     type: 'aeolian'     },
  { name: 'Locrian',     type: 'locrian'     },
];

/** All 12 pitch classes as roots.
 *  Eb, Ab, Bb are used instead of D#, G#, A# to avoid double-sharps in the
 *  generated scales (e.g. A# major produces C##, F##, G##). */
const ROOT_NOTES = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];
const rootOptions = ROOT_NOTES.map((n) => ({
  value: n,
  label: `${enharmonicDisplayLabel(n) ?? n} Major`,
}));

const SLIDER_MARKS = [
  { value: 0, label: '0' },
  { value: 1, label: '1' },
  { value: 3, label: '3' },
  { value: 5, label: '5' },
  { value: 7, label: '7' },
  { value: 9, label: '9' },
  { value: 12, label: '12' },
  { value: 15, label: '15' },
  { value: 17, label: '17' },
  { value: 19, label: '19' },
  { value: 21, label: '21' },
  { value: 24, label: '24' },
];

interface ScaleModesProps {
  tuning: string[];
  fretCount: number;
  initialRoot?: string;
  onRootChange?: (root: string) => void;
  initialFretRange?: [number, number];
  onFretRangeChange?: (range: [number, number]) => void;
}

export function ScaleModes({
  tuning,
  fretCount,
  initialRoot,
  onRootChange,
  initialFretRange,
  onFretRangeChange,
}: ScaleModesProps) {
  const [root, setRootState] = useState(initialRoot ?? 'C');
  const [labelMode, setLabelMode] = useState<DotLabelMode>('note');
  const [fretRange, setFretRangeState] = useState<[number, number]>(
    initialFretRange ?? [0, 12],
  );
  const [startFret, endFret] = fretRange;

  function setRoot(r: string) {
    setRootState(r);
    onRootChange?.(r);
  }

  function setFretRange(range: [number, number]) {
    setFretRangeState(range);
    onFretRangeChange?.(range);
  }

  /** Compute all mode data from the selected major scale root. */
  const { majorScaleName, majorScaleNotes, majorIntervals, majorIntervalMap, highlightedPositions, modes } = useMemo(() => {
    const scaleInfo = getScale(root, 'major');
    const majorNotes = scaleInfo?.notes ?? [];
    const fretboard = buildFretboard(tuning, fretCount);
    const highlightedPositions = majorNotes.length > 0
      ? filterByPitchClasses(fretboard, majorNotes)
      : [];

    const modes = MODES.map((mode, i) => {
      const modeRoot = majorNotes[i] ?? root;
      // Get mode-specific intervals through the scales service
      const modeInfo = getScale(modeRoot, mode.type);
      const modeNotes = modeInfo?.notes ?? majorNotes;
      const intervalMap = buildIntervalMap(modeNotes, modeInfo?.intervals ?? []);
      return {
        name: mode.name,
        root: modeRoot,
        label: `${modeRoot} ${mode.name}`,
        intervalMap,
      };
    });

    const majorIntervals = scaleInfo?.intervals ?? [];
    const majorIntervalMap = buildIntervalMap(majorNotes, majorIntervals);

    return {
      majorScaleName: scaleInfo?.name ?? `${root} Major`,
      majorScaleNotes: majorNotes,
      majorIntervals,
      majorIntervalMap,
      highlightedPositions,
      modes,
    };
  }, [root, tuning, fretCount]);

  const fretCountDisplay = endFret - startFret;

  return (
    <div>
      {/* Controls — hidden in print */}
      <div className={styles.printHide}>
        <Title order={1} mb="xs">
          Mode Scales
        </Title>
        <Text c="dimmed" mb="xl">
          The seven modes of a major scale, shown side by side.
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

        <Text size="sm" mb={4}>
          Frets: {startFret} – {endFret}
        </Text>
        <RangeSlider
          value={fretRange}
          onChange={setFretRange}
          min={0}
          max={fretCount}
          minRange={2}
          step={1}
          mb="lg"
          w={400}
          marks={SLIDER_MARKS}
        />
      </div>

      {/* Printable content */}
      <div className={styles.printContent}>
        <Title order={3} mb="xs" className={styles.pageTitle}>
          {majorScaleName}
        </Title>
        <Text size="sm" c="dimmed" mb="md">
          <ScaleNoteList notes={majorScaleNotes} intervals={majorIntervals} intervalMap={majorIntervalMap} />
        </Text>

        <div className={styles.modesGrid}>
          {modes.map((mode) => (
            <div key={mode.root} className={styles.modeCard}>
              <Text size="xs" fw={600} mb={4} className={styles.modeLabel}>
                {mode.label}
              </Text>
              <FretboardDiagram
                tuning={tuning}
                fretCount={fretCountDisplay}
                startFret={startFret}
                highlightedPositions={highlightedPositions}
                root={mode.root}
                labelMode={labelMode}
                intervalMap={mode.intervalMap}
                orientation="vertical"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
