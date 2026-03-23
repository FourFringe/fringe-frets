import { Title, Text, Stack, Anchor, Divider, Container } from '@mantine/core';

export function Landing() {
  return (
    <Container size="sm" py="xl">
      <Stack gap="lg">
        <div>
          <Title order={1} mb="xs">
            Four Fringe Projects
          </Title>
          <Text c="dimmed">Projects and tools for Musicians and Writers</Text>
        </div>

        <Divider />

        <div>
          <Title order={3} mb="xs">
            Fringe Frets
          </Title>
          <Text mb="sm">
            An interactive toolkit for exploring scales, chords, and modes on fretted
            instruments.
          </Text>
          <Anchor href="https://frets.fourfringe.com" size="sm">
            frets.fourfringe.com &rarr;
          </Anchor>
        </div>
      </Stack>
    </Container>
  );
}
