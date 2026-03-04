import { useState, useMemo } from 'react';
import {
  Title,
  Text,
  Select,
  Group,
  SegmentedControl,
  Stack,
  Button,
  ActionIcon,
  Paper,
} from '@mantine/core';
import { NOTE_NAMES } from '../../models/music';
import { getCommonChordTypes, getChord, getChordNotes } from '../../services/chords';
import { buildIntervalMap } from '../../services/intervals';
import { suggestVoicings } from '../../services/chordVoicing';
import { ChordBox } from '../../components/chordbox';
import type { DotLabelMode } from '../../components/fretboard';

interface ChordBuilderProps {
  tuning: string[];
  fretCount: number;
}

interface ChordSlotState {
  id: number;
  root: string;
  chordType: string;
  voicingIndex: number;
}

let _nextId = 5;

const DEFAULT_SLOTS: ChordSlotState[] = [
  { id: 1, root: 'G', chordType: 'major', voicingIndex: 0 },
  { id: 2, root: 'E', chordType: 'minor', voicingIndex: 0 },
  { id: 3, root: 'C', chordType: 'major', voicingIndex: 0 },
  { id: 4, root: 'D', chordType: 'major', voicingIndex: 0 },
];

const chordTypeOptions = Object.entries(getCommonChordTypes()).map(([group, types]) => ({
  group,
  items: types.map((t) => ({ value: t, label: t })),
}));

const noteOptions = NOTE_NAMES.map((n) => ({ value: n, label: n }));

// ─── Single chord slot card ───────────────────────────────────────────────────

interface ChordSlotCardProps {
  slot: ChordSlotState;
  tuning: string[];
  labelMode: DotLabelMode;
  fretWindow: number;
  onRootChange: (root: string) => void;
  onTypeChange: (type: string) => void;
  onVoicingShift: (delta: number) => void;
  onRemove: () => void;
  removable: boolean;
}

function ChordSlotCard({
  slot,
  tuning,
  labelMode,
  fretWindow,
  onRootChange,
  onTypeChange,
  onVoicingShift,
  onRemove,
  removable,
}: ChordSlotCardProps) {
  const notes = useMemo(
    () => getChordNotes(slot.root, slot.chordType),
    [slot.root, slot.chordType],
  );
  const chordInfo = useMemo(
    () => getChord(slot.root, slot.chordType),
    [slot.root, slot.chordType],
  );
  const intervalMap = useMemo(() => {
    const intervals = chordInfo?.intervals ?? [];
    return notes.length > 0 ? buildIntervalMap(notes, intervals) : {};
  }, [notes, chordInfo]);

  const voicings = useMemo(
    () => suggestVoicings(notes, tuning, fretWindow),
    [notes, tuning, fretWindow],
  );

  const totalVoicings = voicings.length;
  const safeIndex =
    totalVoicings > 0
      ? ((slot.voicingIndex % totalVoicings) + totalVoicings) % totalVoicings
      : 0;
  const voicing = voicings[safeIndex] ?? null;

  const label = chordInfo?.symbol ?? `${slot.root} ${slot.chordType}`;

  return (
    <Paper
      withBorder
      p="sm"
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}
      data-testid="chord-slot"
    >
      {/* Selectors */}
      <Group gap={4} wrap="nowrap">
        <Select
          data={noteOptions}
          value={slot.root}
          onChange={(v) => v && onRootChange(v)}
          size="xs"
          w={66}
          aria-label="Root note"
          comboboxProps={{ withinPortal: true }}
        />
        <Select
          data={chordTypeOptions}
          value={slot.chordType}
          onChange={(v) => v && onTypeChange(v)}
          searchable
          size="xs"
          w={140}
          aria-label="Chord type"
          comboboxProps={{ withinPortal: true }}
        />
      </Group>

      {/* Chord diagram */}
      {voicing !== null ? (
        <ChordBox
          voicing={voicing}
          tuning={tuning}
          fretWindow={fretWindow}
          root={slot.root}
          labelMode={labelMode}
          intervalMap={intervalMap}
          label={label}
        />
      ) : (
        <Text size="xs" c="dimmed" py="sm">
          No voicing found
        </Text>
      )}

      {/* Voicing navigator */}
      {totalVoicings > 1 && (
        <Group gap={4} align="center">
          <ActionIcon
            variant="subtle"
            size="xs"
            onClick={() => onVoicingShift(-1)}
            aria-label="Previous voicing"
          >
            ‹
          </ActionIcon>
          <Text size="xs" c="dimmed" style={{ minWidth: 32, textAlign: 'center' }}>
            {safeIndex + 1}/{totalVoicings}
          </Text>
          <ActionIcon
            variant="subtle"
            size="xs"
            onClick={() => onVoicingShift(1)}
            aria-label="Next voicing"
          >
            ›
          </ActionIcon>
        </Group>
      )}

      {/* Remove button */}
      {removable && (
        <ActionIcon
          variant="subtle"
          color="red"
          size="xs"
          onClick={onRemove}
          aria-label="Remove chord"
          title="Remove this chord"
        >
          ✕
        </ActionIcon>
      )}
    </Paper>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function ChordBuilder({ tuning }: ChordBuilderProps) {
  const [slots, setSlots] = useState<ChordSlotState[]>(DEFAULT_SLOTS);
  const [labelMode, setLabelMode] = useState<DotLabelMode>('note');
  const [fretWindow, setFretWindow] = useState(4);

  function addSlot() {
    setSlots((prev) => [
      ...prev,
      { id: _nextId++, root: 'C', chordType: 'major', voicingIndex: 0 },
    ]);
  }

  function removeSlot(id: number) {
    setSlots((prev) => prev.filter((s) => s.id !== id));
  }

  function updateSlot(id: number, patch: Partial<ChordSlotState>) {
    setSlots((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  }

  function shiftVoicing(id: number, delta: number, curFretWindow: number) {
    setSlots((prev) =>
      prev.map((s) => {
        if (s.id !== id) return s;
        const notes = getChordNotes(s.root, s.chordType);
        const total = suggestVoicings(notes, tuning, curFretWindow).length;
        if (total === 0) return s;
        const newIndex = ((s.voicingIndex + delta) % total + total) % total;
        return { ...s, voicingIndex: newIndex };
      }),
    );
  }

  return (
    <div>
      <Title order={1} mb="xs">
        Chord Builder
      </Title>
      <Text c="dimmed" mb="xl">
        Build a chord progression — each card shows a chord voicing you can cycle through.
      </Text>

      {/* Global controls */}
      <Group mb="lg" align="flex-end" gap="lg">
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

        <Stack gap={4}>
          <Text size="sm" fw={500}>
            Fret window
          </Text>
          <Group gap={4}>
            {[4, 5, 6].map((n) => (
              <Button
                key={n}
                size="xs"
                variant={fretWindow === n ? 'filled' : 'outline'}
                onClick={() => setFretWindow(n)}
              >
                {n}
              </Button>
            ))}
          </Group>
        </Stack>
      </Group>

      {/* Chord slot grid */}
      <Group align="flex-start" gap="sm" style={{ flexWrap: 'wrap' }}>
        {slots.map((slot) => (
          <ChordSlotCard
            key={slot.id}
            slot={slot}
            tuning={tuning}
            labelMode={labelMode}
            fretWindow={fretWindow}
            onRootChange={(root) => updateSlot(slot.id, { root, voicingIndex: 0 })}
            onTypeChange={(chordType) => updateSlot(slot.id, { chordType, voicingIndex: 0 })}
            onVoicingShift={(delta) => shiftVoicing(slot.id, delta, fretWindow)}
            onRemove={() => removeSlot(slot.id)}
            removable={slots.length > 1}
          />
        ))}

        <Button
          variant="outline"
          size="sm"
          onClick={addSlot}
          style={{ alignSelf: 'flex-start' }}
          aria-label="Add chord"
        >
          + Add chord
        </Button>
      </Group>
    </div>
  );
}
