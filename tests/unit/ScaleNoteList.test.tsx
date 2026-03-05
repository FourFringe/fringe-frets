import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ScaleNoteList } from '../../src/components/ScaleNoteList';

const C_MAJOR_NOTES = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
const C_MAJOR_INTERVALS = ['1P', '2M', '3M', '4P', '5P', '6M', '7M'];
const C_MAJOR_MAP: Record<string, string> = {
  C: 'R', D: '2', E: '3', F: '4', G: '5', A: '6', B: '7',
};

describe('ScaleNoteList', () => {
  it('renders nothing when notes is empty', () => {
    const { container } = render(
      <ScaleNoteList notes={[]} intervals={[]} intervalMap={{}} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders all note names', () => {
    render(
      <ScaleNoteList
        notes={C_MAJOR_NOTES}
        intervals={C_MAJOR_INTERVALS}
        intervalMap={C_MAJOR_MAP}
      />,
    );
    C_MAJOR_NOTES.forEach((note) => {
      expect(screen.getByText(note)).toBeTruthy();
    });
  });

  it('renders all interval labels', () => {
    render(
      <ScaleNoteList
        notes={C_MAJOR_NOTES}
        intervals={C_MAJOR_INTERVALS}
        intervalMap={C_MAJOR_MAP}
      />,
    );
    Object.values(C_MAJOR_MAP).forEach((label) => {
      expect(screen.getByText(label)).toBeTruthy();
    });
  });

  it('uses — for whole steps and · for half steps', () => {
    // C major: E→F and B→C are half steps; all others are whole steps
    const { container } = render(
      <ScaleNoteList
        notes={C_MAJOR_NOTES}
        intervals={C_MAJOR_INTERVALS}
        intervalMap={C_MAJOR_MAP}
      />,
    );
    const separators = Array.from(container.querySelectorAll('span')).map(
      (s) => s.textContent?.trim(),
    );
    expect(separators).toContain('—'); // whole steps
    expect(separators).toContain('·'); // half steps (E→F)
  });
});
