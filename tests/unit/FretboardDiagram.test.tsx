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
        labelMode="note"
      />,
    );
    const dots = screen.getByTestId('fretboard-dots');
    expect(dots.querySelectorAll('circle').length).toBe(2);
  });

  it('shows note names inside dots when labelMode is note', () => {
    const positions: FretPosition[] = [
      { string: 0, fret: 3, note: 'G', octave: 2, midi: 43 },
    ];
    render(
      <FretboardDiagram
        tuning={GUITAR_TUNING}
        fretCount={5}
        highlightedPositions={positions}
        labelMode="note"
      />,
    );
    const dots = screen.getByTestId('fretboard-dots');
    expect(dots.textContent).toContain('G');
  });

  it('shows interval labels when labelMode is interval', () => {
    const positions: FretPosition[] = [
      { string: 0, fret: 3, note: 'G', octave: 2, midi: 43 },
      { string: 0, fret: 5, note: 'A', octave: 2, midi: 45 },
    ];
    const intervalMap = { G: '5', A: '6' };
    render(
      <FretboardDiagram
        tuning={GUITAR_TUNING}
        fretCount={7}
        highlightedPositions={positions}
        labelMode="interval"
        intervalMap={intervalMap}
      />,
    );
    const dots = screen.getByTestId('fretboard-dots');
    expect(dots.textContent).toContain('5');
    expect(dots.textContent).toContain('6');
    // Should NOT contain the note name
    expect(dots.textContent).not.toContain('G');
  });

  it('hides labels when labelMode is none', () => {
    const positions: FretPosition[] = [
      { string: 0, fret: 3, note: 'G', octave: 2, midi: 43 },
    ];
    render(
      <FretboardDiagram
        tuning={GUITAR_TUNING}
        fretCount={5}
        highlightedPositions={positions}
        labelMode="none"
      />,
    );
    const dots = screen.getByTestId('fretboard-dots');
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
    const svg = screen.getByTestId('fretboard-diagram');
    expect(svg).toBeTruthy();
    // Check string labels exist
    const labels = screen.getByTestId('fretboard-labels');
    expect(labels.textContent).toContain('G');
    expect(labels.textContent).toContain('C');
    expect(labels.textContent).toContain('A');
  });

  it('renders open-string (fret 0) dots as hollow circles', () => {
    const positions: FretPosition[] = [
      { string: 0, fret: 0, note: 'E', octave: 2, midi: 40 },
      { string: 0, fret: 3, note: 'G', octave: 2, midi: 43 },
    ];
    render(
      <FretboardDiagram
        tuning={GUITAR_TUNING}
        fretCount={5}
        highlightedPositions={positions}
        labelMode="note"
      />,
    );
    const dots = screen.getByTestId('fretboard-dots');
    const groups = dots.querySelectorAll('g[data-open="true"]');
    // One fret-0 position should be rendered as open
    expect(groups.length).toBe(1);
    const openCircle = groups[0].querySelector('circle');
    // Open-string dots have fill="none" (hollow)
    expect(openCircle?.getAttribute('fill')).toBe('none');
  });

  it('renders fretted dots as filled circles', () => {
    const positions: FretPosition[] = [
      { string: 0, fret: 3, note: 'G', octave: 2, midi: 43 },
    ];
    render(
      <FretboardDiagram
        tuning={GUITAR_TUNING}
        fretCount={5}
        highlightedPositions={positions}
        labelMode="note"
      />,
    );
    const dots = screen.getByTestId('fretboard-dots');
    const openGroups = dots.querySelectorAll('g[data-open="true"]');
    expect(openGroups.length).toBe(0);
    // The fretted dot should have a filled circle
    const circle = dots.querySelector('circle');
    expect(circle?.getAttribute('fill')).not.toBe('none');
  });

  it('does not render a hollow open circle for a fretted note at the left edge of a shifted viewport', () => {
    // Regression: when startFret=5, a note at fret 5 has displayFret=0 but is NOT an open string.
    // It must render as a filled dot, not a hollow open-string ring.
    const positions: FretPosition[] = [
      { string: 0, fret: 5, note: 'A', octave: 2, midi: 45 },
    ];
    render(
      <FretboardDiagram
        tuning={GUITAR_TUNING}
        fretCount={5}
        startFret={5}
        highlightedPositions={positions}
        labelMode="note"
      />,
    );
    const dots = screen.getByTestId('fretboard-dots');
    // No hollow open-string ring
    expect(dots.querySelectorAll('g[data-open="true"]').length).toBe(0);
    // The dot should be filled
    const circle = dots.querySelector('circle');
    expect(circle?.getAttribute('fill')).not.toBe('none');
  });

  it('open-string dot labels use colored text (not white)', () => {
    const positions: FretPosition[] = [
      { string: 0, fret: 0, note: 'E', octave: 2, midi: 40 },
    ];
    render(
      <FretboardDiagram
        tuning={GUITAR_TUNING}
        fretCount={5}
        highlightedPositions={positions}
        labelMode="note"
      />,
    );
    const dots = screen.getByTestId('fretboard-dots');
    const textEl = dots.querySelector('text');
    // Open-string label should NOT be white (since circle is hollow)
    expect(textEl?.getAttribute('fill')).not.toBe('white');
  });
});
