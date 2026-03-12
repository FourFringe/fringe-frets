import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import { Home } from '../../src/pages/Home/Home';

describe('Home', () => {
  const renderHome = () =>
    render(
      <MantineProvider>
        <Home />
      </MantineProvider>,
    );

  it('renders the welcome title', () => {
    renderHome();
    expect(screen.getByText('Welcome to Fringe Frets')).toBeTruthy();
  });

  it('renders section headings', () => {
    renderHome();
    expect(screen.getByText('Explore')).toBeTruthy();
    expect(screen.getByText('Modes')).toBeTruthy();
  });

  it('renders tool descriptions', () => {
    renderHome();
    expect(screen.getByText('Scale Explorer')).toBeTruthy();
    expect(screen.getByText('Chord Explorer')).toBeTruthy();
    expect(screen.getByText('Scale Modes')).toBeTruthy();
    expect(screen.getByText('Mode Chords')).toBeTruthy();
  });
});
