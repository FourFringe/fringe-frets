import { useState } from 'react';
import { Title, Text, Select, Group, SegmentedControl, Slider, Stack } from '@mantine/core';
import { NOTE_NAMES } from '../../models/music';
import { getCommonChordTypes } from '../../services/chords';
import { useChord } from '../../hooks/useChord';
import { FretboardDiagram } from '../../components/fretboard';
import type { DotLabelMode } from '../../components/fretboard';

interface ChordBuilderProps {
  tuning: string[];
  fretCount: number;
}

const commonChords = getCommonChordTypes();
const chordOptions = Object.entries(commonChords).map(([group, types]) => ({
  group,
  items: types.map((t) => ({ value: t, label: t })),
}));

const noteOptions = NOTE_NAMES.map((n) => ({ value: n, label: n }));

export function ChordBuilder({ tuning, fretCount }: ChordBuilderProps) {
  const [rootNote, setRootNote] = useState('C');
  const [chordType, setChordType] = useState('major');
  const [labelMode, setLabelMode] = useState<DotLabelMode>('note');
  const [visibleFrets, setVisibleFrets] = useState(fretCount);

  const { chord, notes, intervalMap, highlightedPositions } = useChord(
    rootNote,
    chordType,
    tuning,
    fretCount,
  );

  return (
    <div>
      <Title order={1} mb="xs">
        Chord Builder
      </Title>
      <Text c="dimmed" mb="xl">
        Select a root note and chord type to see the chord tones and voicings.
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
          label="Chord Type"
          data={chordOptions}
          value={chordType}
          onChange={(v) => v && setChordType(v)}
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
        {chord?.symbol ?? `${rootNote} ${chordType}`}
      </Title>
      <Text size="sm" c="dimmed" mb="md">
        Notes: {notes.join(' - ')}
      </Text>
      {chord?.intervals && (
        <Text size="sm" c="dimmed" mb="md">
          Intervals: {chord.intervals.join(' - ')}
        </Text>
      )}

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
