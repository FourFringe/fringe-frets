import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { MantineProvider } from '@mantine/core';
import { Home } from '../../src/pages/Home/Home';

describe('Home', () => {
  const renderHome = () =>
    render(
      <MantineProvider>
        <MemoryRouter>
          <Home />
        </MemoryRouter>
      </MantineProvider>,
    );

  it('renders the welcome title', () => {
    renderHome();
    expect(screen.getByText('Welcome to Fringe Frets')).toBeTruthy();
  });

  it('renders all four feature cards', () => {
    renderHome();
    expect(screen.getByText('Scale Explorer')).toBeTruthy();
    expect(screen.getByText('Chord Builder')).toBeTruthy();
    expect(screen.getByText('Tab Viewer')).toBeTruthy();
    expect(screen.getByText('Multi-Instrument')).toBeTruthy();
  });

  it('renders descriptions for each feature', () => {
    renderHome();
    expect(screen.getByText(/Visualize any scale/)).toBeTruthy();
    expect(screen.getByText(/Build and explore chord/)).toBeTruthy();
    expect(screen.getByText(/View and print tablature/)).toBeTruthy();
    expect(screen.getByText(/Switch between guitar/)).toBeTruthy();
  });
});
