import { useNavigate } from 'react-router';
import { Title, Text, SimpleGrid, Card, ThemeIcon } from '@mantine/core';

const features = [
  {
    title: 'Scale Explorer',
    description:
      'Visualize any scale on the fretboard. See note positions, intervals, and patterns across all strings.',
    icon: '🎵',
    color: 'blue',
    path: '/scales',
  },
  {
    title: 'Chord Builder',
    description:
      'Build and explore chord voicings. See how chords are constructed and find fingering positions on the fretboard.',
    icon: '🎸',
    color: 'violet',
    path: '/chords',
  },
  {
    title: 'Tab Viewer',
    description:
      'View and print tablature with fretboard diagrams. Create printable music sheets for practice.',
    icon: '📄',
    color: 'teal',
    path: '/tabs',
  },
  {
    title: 'Multi-Instrument',
    description:
      'Switch between guitar, mandolin, ukulele, violin, and cello. All tools adapt to the selected instrument.',
    icon: '🎻',
    color: 'orange',
    path: null,
  },
] as const;

export function Home() {
  const navigate = useNavigate();

  return (
    <div>
      <Title order={1} mb="xs">
        Welcome to Fringe Frets
      </Title>
      <Text c="dimmed" mb="xl">
        Explore the fretboard, learn scales, and build chord voicings for stringed instruments.
      </Text>

      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
        {features.map((feat) => (
          <Card
            key={feat.title}
            padding="lg"
            radius="md"
            withBorder
            style={feat.path ? { cursor: 'pointer' } : undefined}
            onClick={feat.path ? () => navigate(feat.path!) : undefined}
          >
            <ThemeIcon size="xl" radius="md" variant="light" color={feat.color} mb="sm">
              {feat.icon}
            </ThemeIcon>
            <Title order={3} mb="xs">
              {feat.title}
            </Title>
            <Text size="sm" c="dimmed">
              {feat.description}
            </Text>
          </Card>
        ))}
      </SimpleGrid>
    </div>
  );
}
