import { useState } from 'react';
import { Title, Text, Select, Group } from '@mantine/core';
import { NOTE_NAMES } from '../../models/music';
import { getCommonScaleTypes } from '../../services/scales';
import { useScale } from '../../hooks/useScale';
import { FretboardDiagram } from '../../components/fretboard';

interface ScaleExplorerProps {
  tuning: string[];
  fretCount: number;
}

const commonScales = getCommonScaleTypes();
const scaleOptions = Object.entries(commonScales).flatMap(([group, types]) =>
  types.map((t) => ({ value: t, label: t, group })),
);

const noteOptions = NOTE_NAMES.map((n) => ({ value: n, label: n }));

export function ScaleExplorer({ tuning, fretCount }: ScaleExplorerProps) {
  const [rootNote, setRootNote] = useState('C');
  const [scaleType, setScaleType] = useState('major');

  const { scaleName, notes, highlightedPositions } = useScale(rootNote, scaleType, tuning, fretCount);

  return (
    <div>
      <Title order={1} mb="xs">
        Scale Explorer
      </Title>
      <Text c="dimmed" mb="xl">
        Select a root note and scale type to visualize it on the fretboard.
      </Text>

      <Group mb="xl">
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
      </Group>

      <Title order={3} mb="sm">
        {scaleName}
      </Title>
      <Text size="sm" c="dimmed" mb="md">
        Notes: {notes.join(' – ')}
      </Text>
      <div style={{ overflowX: 'auto', marginTop: '1rem' }}>
        <FretboardDiagram
          tuning={tuning}
          fretCount={fretCount}
          highlightedPositions={highlightedPositions}
          root={rootNote}
          showNoteNames
        />
      </div>
    </div>
  );
}
