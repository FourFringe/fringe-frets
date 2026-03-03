import { Title, Text, SimpleGrid, Card, ThemeIcon } from '@mantine/core';

export function Home() {
  return (
    <div>
      <Title order={1} mb="xs">
        Welcome to Fringe Frets
      </Title>
      <Text c="dimmed" mb="xl">
        Explore the fretboard, learn scales, and build chord voicings for stringed instruments.
      </Text>

      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
        <Card padding="lg" radius="md" withBorder>
          <ThemeIcon size="xl" radius="md" variant="light" color="blue" mb="sm">
            🎵
          </ThemeIcon>
          <Title order={3} mb="xs">
            Scale Explorer
          </Title>
          <Text size="sm" c="dimmed">
            Visualize any scale on the fretboard. See note positions, intervals, and patterns across
            all strings.
          </Text>
        </Card>

        <Card padding="lg" radius="md" withBorder>
          <ThemeIcon size="xl" radius="md" variant="light" color="violet" mb="sm">
            🎸
          </ThemeIcon>
          <Title order={3} mb="xs">
            Chord Builder
          </Title>
          <Text size="sm" c="dimmed">
            Build and explore chord voicings. See how chords are constructed and find fingering
            positions on the fretboard.
          </Text>
        </Card>

        <Card padding="lg" radius="md" withBorder>
          <ThemeIcon size="xl" radius="md" variant="light" color="teal" mb="sm">
            📄
          </ThemeIcon>
          <Title order={3} mb="xs">
            Tab Viewer
          </Title>
          <Text size="sm" c="dimmed">
            View and print tablature with fretboard diagrams. Create printable music sheets for
            practice.
          </Text>
        </Card>

        <Card padding="lg" radius="md" withBorder>
          <ThemeIcon size="xl" radius="md" variant="light" color="orange" mb="sm">
            🎻
          </ThemeIcon>
          <Title order={3} mb="xs">
            Multi-Instrument
          </Title>
          <Text size="sm" c="dimmed">
            Switch between guitar, mandolin, ukulele, violin, and cello. All tools adapt to the
            selected instrument.
          </Text>
        </Card>
      </SimpleGrid>
    </div>
  );
}
