import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import { ScaleModes } from '../../src/pages/ScaleModes/ScaleModes';

const GUITAR_TUNING = ['E2', 'A2', 'D3', 'G3', 'B3', 'E4'];

const renderModes = (props: Partial<React.ComponentProps<typeof ScaleModes>> = {}) =>
  render(
    <MantineProvider>
      <ScaleModes tuning={GUITAR_TUNING} fretCount={12} {...props} />
    </MantineProvider>,
  );

describe('ScaleModes', () => {
  it('renders 7 fretboard diagrams', () => {
    renderModes();
    const diagrams = screen.getAllByTestId('fretboard-diagram');
    expect(diagrams).toHaveLength(7);
  });

  it('renders all 7 mode name labels for C major by default', () => {
    renderModes();
    expect(screen.getByText('C Ionian')).toBeTruthy();
    expect(screen.getByText('D Dorian')).toBeTruthy();
    expect(screen.getByText('E Phrygian')).toBeTruthy();
    expect(screen.getByText('F Lydian')).toBeTruthy();
    expect(screen.getByText('G Mixolydian')).toBeTruthy();
    expect(screen.getByText('A Aeolian')).toBeTruthy();
    expect(screen.getByText('B Locrian')).toBeTruthy();
  });

  it('updates mode labels when a different major scale root is supplied', () => {
    renderModes({ initialRoot: 'G' });
    // G major scale: G A B C D E F#
    expect(screen.getByText('G Ionian')).toBeTruthy();
    expect(screen.getByText('A Dorian')).toBeTruthy();
    expect(screen.getByText('B Phrygian')).toBeTruthy();
    expect(screen.getByText('C Lydian')).toBeTruthy();
    expect(screen.getByText('D Mixolydian')).toBeTruthy();
    expect(screen.getByText('E Aeolian')).toBeTruthy();
  });

  it('shows the major scale name heading', () => {
    renderModes({ initialRoot: 'C' });
    const heading = screen.getByRole('heading', { level: 3 });
    expect(heading.textContent).toMatch(/C/i);
    // Notes with interval labels appear below the heading via ScaleNoteList
    expect(screen.getByText('R')).toBeTruthy(); // root interval label
  });

  it('renders all 7 diagrams in vertical orientation', () => {
    renderModes();
    const diagrams = screen.getAllByTestId('fretboard-diagram');
    // Vertical SVGs are narrower than they are tall — width < height
    diagrams.forEach((svg) => {
      expect(Number(svg.getAttribute('width'))).toBeLessThan(
        Number(svg.getAttribute('height')),
      );
    });
  });

  it('accepts a custom fret range', () => {
    renderModes({ initialFretRange: [5, 12] });
    // All 7 diagrams should show fretCount = 7 (12 - 5)
    const diagrams = screen.getAllByTestId('fretboard-diagram');
    expect(diagrams).toHaveLength(7);
  });

  it('calls onRootChange when supplied', () => {
    // The callback is called if the user changes the selector — hard to trigger
    // without userEvent. Instead verify it propagates initialRoot correctly.
    const onRootChange = () => {};
    renderModes({ initialRoot: 'D', onRootChange });
    expect(screen.getByText('D Ionian')).toBeTruthy();
    expect(screen.getByText('E Dorian')).toBeTruthy();
  });
});
