import { useState } from 'react';
import { Title, Text, Select, Group, SegmentedControl, RangeSlider, Stack } from '@mantine/core';
import { NOTE_NAMES } from '../../models/music';
import { getCommonScaleTypes, formatScaleNotes } from '../../services/scales';
import { useScale } from '../../hooks/useScale';
import { FretboardDiagram } from '../../components/fretboard';
import type { DotLabelMode } from '../../components/fretboard';

interface ScaleExplorerProps {
  tuning: string[];
  fretCount: number;
  initialFretRange?: [number, number];
  onFretRangeChange?: (range: [number, number]) => void;
}

const commonScales = getCommonScaleTypes();
const scaleOptions = Object.entries(commonScales).map(([group, types]) => ({
  group,
  items: types.map((t) => ({ value: t, label: t })),
}));

const noteOptions = NOTE_NAMES.map((n) => ({ value: n, label: n }));

export function ScaleExplorer({ tuning, fretCount, initialFretRange, onFretRangeChange }: ScaleExplorerProps) {
  const [rootNote, setRootNote] = useState('C');
  const [scaleType, setScaleType] = useState('major');
  const [labelMode, setLabelMode] = useState<DotLabelMode>('note');
  const [fretRange, setFretRangeState] = useState<[number, number]>(
    initialFretRange ?? [0, fretCount],
  );
  const [startFret, endFret] = fretRange;

  function setFretRange(range: [number, number]) {
    setFretRangeState(range);
    onFretRangeChange?.(range);
  }

  const { scaleName, notes, intervals, intervalMap, highlightedPositions } = useScale(
    rootNote,
    scaleType,
    tuning,
    fretCount,
  );

  return (
    <div>
      <Title order={1} mb="xs">
        Scale Explorer
      </Title>
      <Text c="dimmed" mb="xl">
        Select a root note and scale type to visualize it on the fretboard.
      </Text>

      <Group mb="lg">
        <Select
          label="Root Note"
          data={noteOptions}
          value={rootNote}
          onChange={(v) => v && setRootNote(v)}
          w={120}
        />
        <Select
          label="Scale Type"
          data={scaleOptions}
          value={scaleType}
          onChange={(v) => v && setScaleType(v)}
          searchable
          w={200}
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

      <Title order={3} mb="xs">
        {scaleName}
      </Title>
      <Text size="sm" c="dimmed" mb="md">
        Notes: {formatScaleNotes(notes, intervals)}
      </Text>

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
        marks={[
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
        ]}
      />

      <div style={{ overflowX: 'auto' }}>
        <FretboardDiagram
          tuning={tuning}
          fretCount={endFret - startFret}
          startFret={startFret}
          highlightedPositions={highlightedPositions}
          root={rootNote}
          labelMode={labelMode}
          intervalMap={intervalMap}
        />
      </div>
    </div>
  );
}
