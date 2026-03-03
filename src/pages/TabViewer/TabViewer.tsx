import { Title, Text } from '@mantine/core';

export function TabViewer() {
  return (
    <div>
      <Title order={1} mb="xs">
        Tab Viewer
      </Title>
      <Text c="dimmed" mb="xl">
        View and print tablature with fretboard diagrams. This feature is coming soon.
      </Text>

      <Text size="sm" c="dimmed">
        The Tab Viewer will support loading tablature, rendering it alongside fretboard diagrams,
        and printing complete music sheets for offline practice.
      </Text>

      {/* TODO: Tablature rendering with VexFlow */}
    </div>
  );
}
