import { Title, Text, Divider, Stack } from '@mantine/core';

export function Home() {
  return (
    <Stack gap="lg" maw={720}>
      <div>
        <Title order={1} mb="xs">
          Welcome to Fringe Frets
        </Title>
        <Text c="dimmed">
          An interactive toolkit for exploring scales, chords, and modes on fretted
          instruments. Use the sidebar to navigate between tools.
        </Text>
      </div>

      <Divider />

      <div>
        <Title order={2} mb="xs">
          Explore
        </Title>
        <Text mb="sm">
          The Explorer tools let you freely pick any root note and visualize it on the
          fretboard.
        </Text>
        <Text fw={600} mb={4}>Scale Explorer</Text>
        <Text size="sm" c="dimmed" mb="sm">
          Choose a scale type and root note, then see every note position mapped across
          the fretboard. Useful for learning scale shapes, seeing how patterns connect
          across strings, and understanding intervals within a scale.
        </Text>
        <Text fw={600} mb={4}>Chord Explorer</Text>
        <Text size="sm" c="dimmed">
          Build a chord progression by adding chord cards. Each card shows a voicing
          diagram that you can cycle through to find different fingering positions. Great
          for comparing voicings, building practice progressions, and exploring chord
          construction.
        </Text>
      </div>

      <Divider />

      <div>
        <Title order={2} mb="xs">
          Modes
        </Title>
        <Text mb="sm">
          The Modes tools show how a single parent scale generates seven related scales
          called <em>modes</em>.
        </Text>
        <Text size="sm" c="dimmed" mb="md">
          Every major scale contains seven modes &mdash; each one starts on a different
          degree of the parent scale and uses the same notes, but the shifted starting
          point gives each mode its own character. For example, the C major scale
          (C D E F G A B) produces these modes:
        </Text>
        <Text size="sm" c="dimmed" mb="md" style={{ paddingLeft: '1rem' }}>
          <strong>Ionian</strong> (I) &mdash; the major scale itself, bright and resolved.
          <br />
          <strong>Dorian</strong> (II) &mdash; minor with a raised 6th, jazzy and smooth.
          <br />
          <strong>Phrygian</strong> (III) &mdash; minor with a flat 2nd, dark and Spanish-flavored.
          <br />
          <strong>Lydian</strong> (IV) &mdash; major with a raised 4th, dreamy and floating.
          <br />
          <strong>Mixolydian</strong> (V) &mdash; major with a flat 7th, bluesy and dominant.
          <br />
          <strong>Aeolian</strong> (VI) &mdash; the natural minor scale, melancholy.
          <br />
          <strong>Locrian</strong> (VII) &mdash; diminished, unstable and tense.
        </Text>
        <Text fw={600} mb={4}>Mode Scales</Text>
        <Text size="sm" c="dimmed" mb="sm">
          Shows all seven modes of a selected key as fretboard diagrams side by side, so
          you can compare their note patterns and see how each mode shifts across the neck.
        </Text>
        <Text fw={600} mb={4}>Mode Chords</Text>
        <Text size="sm" c="dimmed">
          Displays the diatonic chords (triads built on each scale degree) for a selected
          key, arranged in rows by fret position. This shows how the same set of chords
          appears at different positions up the neck &mdash; useful for finding chord
          voicings that sit close together for smooth transitions.
        </Text>
      </div>
    </Stack>
  );
}
