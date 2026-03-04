import { useState } from 'react';
import { Title, Text, Select, Group, SegmentedControl, Slider, Stack } from '@mantine/core';
import { NOTE_NAMES } from '../../models/music';
import { getCommonScaleTypes, formatScaleNotes } from '../../services/scales';
import { useScale } from '../../hooks/useScale';
import { FretboardDiagram } from '../../components/fretboard';
import type { DotLabelMode } from '../../components/fretboard';

interface ScaleExplorerProps {
  tuning: string[];
  fretCount: number;
}

const commonScales = getCommonScaleTypes();
const scaleOptions = Object.entries(commonScales).map(([group, types]) => ({
  group,
  items: types.map((t) => ({ value: t, label: t })),
}));

const noteOptions = NOTE_NAMES.map((n) => ({ value: n, label: n }));

export function ScaleExplorer({ tuning, fretCount }: ScaleExplorerProps) {
  const [rootNote, setRootNote] = useState('C');
  const [scaleType, setScaleType] = useState('major');
  const [labelMode, setLabelMode] = useState<DotLabelMode>('note');
  const [visibleFrets, setVisibleFrets] = useState(fretCount);

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
        Frets: {visibleFrets}
      </Text>
      <Slider
        value={visibleFrets}
        onChange={setVisibleFrets}
        min={4}
        max={fretCount}
        step={1}
        mb="lg"
        w={300}
      />

      <div style={{ overflowX: 'auto' }}>
        <FretboardDiagram
          tuning={tuning}
          fretCount={visibleFrets}
          highlightedPositions={highlightedPositions}
          root={rootNote}
          labelMode={labelMode}
          intervalMap={intervalMap}
        />
      </div>
    </div>
  );
}
