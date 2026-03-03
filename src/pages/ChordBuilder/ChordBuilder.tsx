import { useState, useMemo } from 'react';
import { Title, Text, Select, Group } from '@mantine/core';
import { NOTE_NAMES } from '../../models/music';
import { getCommonChordTypes, getChord, getChordNotes } from '../../services/chords';
import { buildFretboard, filterByPitchClasses } from '../../services/fretboard';
import { FretboardDiagram } from '../../components/fretboard';

interface ChordBuilderProps {
  tuning: string[];
  fretCount: number;
}

const commonChords = getCommonChordTypes();
const chordOptions = Object.entries(commonChords).flatMap(([group, types]) =>
  types.map((t) => ({ value: t, label: t, group })),
);

const noteOptions = NOTE_NAMES.map((n) => ({ value: n, label: n }));

export function ChordBuilder({ tuning, fretCount }: ChordBuilderProps) {
  const [rootNote, setRootNote] = useState('C');
  const [chordType, setChordType] = useState('major');

  const chord = getChord(rootNote, chordType);
  const notes = getChordNotes(rootNote, chordType);

  const highlightedPositions = useMemo(() => {
    if (notes.length === 0) return [];
    const fretboard = buildFretboard(tuning, fretCount);
    return filterByPitchClasses(fretboard, notes);
  }, [rootNote, chordType, tuning, fretCount, notes]);

  return (
    <div>
      <Title order={1} mb="xs">
        Chord Builder
      </Title>
      <Text c="dimmed" mb="xl">
        Select a root note and chord type to see the chord tones and voicings.
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
          label="Chord Type"
          data={chordOptions}
          value={chordType}
          onChange={(v) => v && setChordType(v)}
          searchable
          w={200}
        />
      </Group>

      <Title order={3} mb="sm">
        {chord?.symbol ?? `${rootNote} ${chordType}`}
      </Title>
      <Text size="sm" c="dimmed" mb="md">
        Notes: {notes.join(' – ')}
      </Text>
      {chord?.intervals && (
        <Text size="sm" c="dimmed" mb="md">
          Intervals: {chord.intervals.join(' – ')}
        </Text>
      )}

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
