import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FretboardDiagram } from '../../src/components/fretboard/FretboardDiagram';
import type { FretPosition } from '../../src/models/music';

const GUITAR_TUNING = ['E2', 'A2', 'D3', 'G3', 'B3', 'E4'];

describe('FretboardDiagram', () => {
  it('renders an SVG element', () => {
    render(<FretboardDiagram tuning={GUITAR_TUNING} fretCount={5} />);
    const svg = screen.getByTestId('fretboard-diagram');
    expect(svg.tagName).toBe('svg');
  });

  it('renders the grid, labels, and dots groups', () => {
    render(<FretboardDiagram tuning={GUITAR_TUNING} fretCount={5} />);
    expect(screen.getByTestId('fretboard-grid')).toBeTruthy();
    expect(screen.getByTestId('fretboard-labels')).toBeTruthy();
    expect(screen.getByTestId('fretboard-dots')).toBeTruthy();
  });

  it('renders string labels for each tuning note', () => {
    render(<FretboardDiagram tuning={GUITAR_TUNING} fretCount={3} />);
    const labels = screen.getByTestId('fretboard-labels');
    // Should have string labels: E, A, D, G, B, E
    expect(labels.textContent).toContain('E');
    expect(labels.textContent).toContain('A');
    expect(labels.textContent).toContain('D');
    expect(labels.textContent).toContain('G');
    expect(labels.textContent).toContain('B');
  });

  it('renders fret number labels', () => {
    render(<FretboardDiagram tuning={GUITAR_TUNING} fretCount={5} />);
    const labels = screen.getByTestId('fretboard-labels');
    // Should contain fret numbers 1-5
    expect(labels.textContent).toContain('1');
    expect(labels.textContent).toContain('3');
    expect(labels.textContent).toContain('5');
  });

  it('renders highlighted dots for given positions', () => {
    const positions: FretPosition[] = [
      { string: 0, fret: 3, note: 'G', octave: 2, midi: 43 },
      { string: 1, fret: 5, note: 'D', octave: 3, midi: 50 },
    ];
    render(
      <FretboardDiagram
        tuning={GUITAR_TUNING}
        fretCount={7}
        highlightedPositions={positions}
        showNoteNames
      />,
    );
    const dots = screen.getByTestId('fretboard-dots');
    expect(dots.querySelectorAll('circle').length).toBe(2);
  });

  it('shows note names inside dots when showNoteNames is true', () => {
    const positions: FretPosition[] = [
      { string: 0, fret: 3, note: 'G', octave: 2, midi: 43 },
    ];
    render(
      <FretboardDiagram
        tuning={GUITAR_TUNING}
        fretCount={5}
        highlightedPositions={positions}
        showNoteNames
      />,
    );
    const dots = screen.getByTestId('fretboard-dots');
    expect(dots.textContent).toContain('G');
  });

  it('hides note names when showNoteNames is false', () => {
    const positions: FretPosition[] = [
      { string: 0, fret: 3, note: 'G', octave: 2, midi: 43 },
    ];
    render(
      <FretboardDiagram
        tuning={GUITAR_TUNING}
        fretCount={5}
        highlightedPositions={positions}
        showNoteNames={false}
      />,
    );
    const dots = screen.getByTestId('fretboard-dots');
    // Should have circles but no text
    expect(dots.querySelectorAll('circle').length).toBe(1);
    expect(dots.querySelectorAll('text').length).toBe(0);
  });

  it('filters out positions outside the visible fret window', () => {
    const positions: FretPosition[] = [
      { string: 0, fret: 1, note: 'F', octave: 2, midi: 41 },
      { string: 0, fret: 10, note: 'D', octave: 3, midi: 50 },
    ];
    render(
      <FretboardDiagram
        tuning={GUITAR_TUNING}
        fretCount={5}
        startFret={0}
        highlightedPositions={positions}
      />,
    );
    const dots = screen.getByTestId('fretboard-dots');
    // Only fret 1 is within 0–5, fret 10 is outside
    expect(dots.querySelectorAll('circle').length).toBe(1);
  });

  it('renders a nut when startFret is 0', () => {
    render(<FretboardDiagram tuning={GUITAR_TUNING} fretCount={3} startFret={0} />);
    const grid = screen.getByTestId('fretboard-grid');
    const rects = grid.querySelectorAll('rect');
    expect(rects.length).toBe(1); // nut rect
  });

  it('omits the nut when startFret > 0', () => {
    render(<FretboardDiagram tuning={GUITAR_TUNING} fretCount={3} startFret={5} />);
    const grid = screen.getByTestId('fretboard-grid');
    const rects = grid.querySelectorAll('rect');
    expect(rects.length).toBe(0);
  });

  it('works with a 4-string instrument (ukulele)', () => {
    const ukeTuning = ['G4', 'C4', 'E4', 'A4'];
    render(<FretboardDiagram tuning={ukeTuning} fretCount={5} />);
    const grid = screen.getByTestId('fretboard-grid');
    // 4 strings
    const strings = grid.querySelectorAll('line[data-testid]') ?? [];
    const svg = screen.getByTestId('fretboard-diagram');
    expect(svg).toBeTruthy();
    // Check string labels exist
    const labels = screen.getByTestId('fretboard-labels');
    expect(labels.textContent).toContain('G');
    expect(labels.textContent).toContain('C');
    expect(labels.textContent).toContain('A');
  });
});
