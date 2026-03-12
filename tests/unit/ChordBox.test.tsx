import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ChordBox } from '../../src/components/chordbox/ChordBox';
import type { ChordVoicing } from '../../src/services/chordVoicing';

const GUITAR_TUNING = ['E2', 'A2', 'D3', 'G3', 'B3', 'E4'];

// Am open position: E(0) A(0) E(2) A(2) C(1) E(0)
const AM_VOICING: ChordVoicing = {
  strings: [0, 0, 2, 2, 1, 0],
  baseFret: 1,
};

// C major barre at fret 8 (partial — only example data)
const C_BARRE_VOICING: ChordVoicing = {
  strings: [8, 10, 10, 9, 8, 8],
  baseFret: 8,
};

// Voicing with muted strings
const D_VOICING: ChordVoicing = {
  strings: [null, null, 0, 2, 3, 2],
  baseFret: 1,
};

describe('ChordBox', () => {
  describe('SVG element', () => {
    it('renders an svg with the chord-box test id', () => {
      render(
        <ChordBox voicing={AM_VOICING} tuning={GUITAR_TUNING} />,
      );
      expect(screen.getByTestId('chord-box')).toBeInTheDocument();
    });

    it('renders with correct width and height attributes', () => {
      const { container } = render(
        <ChordBox voicing={AM_VOICING} tuning={GUITAR_TUNING} fretWindow={4} />,
      );
      const svg = container.querySelector('svg');
      // width: CB_LEFT_MARGIN(30) + 5*CB_STRING_SPACING(22) + CB_RIGHT_MARGIN(8) = 148
      expect(Number(svg?.getAttribute('width'))).toBe(148);
      // height: CB_TOP_MARGIN(8) + CB_INDICATOR_HEIGHT(28) + 4*CB_FRET_SPACING(24) + CB_BOTTOM_MARGIN(10) = 142
      expect(Number(svg?.getAttribute('height'))).toBe(142);
    });
  });

  describe('nut and position label', () => {
    it('shows the nut for open position (baseFret 1)', () => {
      render(<ChordBox voicing={AM_VOICING} tuning={GUITAR_TUNING} />);
      expect(screen.getByTestId('chord-box-nut')).toBeInTheDocument();
    });

    it('does not show the nut for non-open position', () => {
      render(<ChordBox voicing={C_BARRE_VOICING} tuning={GUITAR_TUNING} />);
      expect(screen.queryByTestId('chord-box-nut')).not.toBeInTheDocument();
    });

    it('shows a position label for non-open position', () => {
      render(<ChordBox voicing={C_BARRE_VOICING} tuning={GUITAR_TUNING} />);
      expect(screen.getByTestId('chord-box-position')).toHaveTextContent('8fr');
    });

    it('does not show a position label for open position', () => {
      render(<ChordBox voicing={AM_VOICING} tuning={GUITAR_TUNING} />);
      expect(screen.queryByTestId('chord-box-position')).not.toBeInTheDocument();
    });
  });

  describe('string indicators', () => {
    it('shows a muted indicator (✕) for null strings', () => {
      render(<ChordBox voicing={D_VOICING} tuning={GUITAR_TUNING} />);
      // D voicing has strings 0 and 1 muted
      expect(screen.getByTestId('chord-box-muted-0')).toBeInTheDocument();
      expect(screen.getByTestId('chord-box-muted-1')).toBeInTheDocument();
    });

    it('shows an open indicator (○) for fret-0 strings', () => {
      render(<ChordBox voicing={AM_VOICING} tuning={GUITAR_TUNING} />);
      // Am voicing: strings 0, 1, and 5 are open
      expect(screen.getByTestId('chord-box-open-0')).toBeInTheDocument();
      expect(screen.getByTestId('chord-box-open-1')).toBeInTheDocument();
      expect(screen.getByTestId('chord-box-open-5')).toBeInTheDocument();
    });

    it('does not show an open indicator for fretted strings', () => {
      render(<ChordBox voicing={AM_VOICING} tuning={GUITAR_TUNING} />);
      // Am: strings 2, 3, 4 are fretted — should have dots, not open indicators
      expect(screen.queryByTestId('chord-box-open-2')).not.toBeInTheDocument();
      expect(screen.queryByTestId('chord-box-open-3')).not.toBeInTheDocument();
      expect(screen.queryByTestId('chord-box-open-4')).not.toBeInTheDocument();
    });
  });

  describe('fretted dots', () => {
    it('renders a dot for each fretted string', () => {
      render(<ChordBox voicing={AM_VOICING} tuning={GUITAR_TUNING} />);
      // Am: 3 fretted strings (indices 2, 3, 4)
      expect(screen.getByTestId('chord-box-dot-2')).toBeInTheDocument();
      expect(screen.getByTestId('chord-box-dot-3')).toBeInTheDocument();
      expect(screen.getByTestId('chord-box-dot-4')).toBeInTheDocument();
    });

    it('does not render dots for open or muted strings', () => {
      render(<ChordBox voicing={D_VOICING} tuning={GUITAR_TUNING} />);
      expect(screen.queryByTestId('chord-box-dot-0')).not.toBeInTheDocument();
      expect(screen.queryByTestId('chord-box-dot-1')).not.toBeInTheDocument();
    });

    it('shows note labels inside dots when labelMode is note', () => {
      render(<ChordBox voicing={AM_VOICING} tuning={GUITAR_TUNING} labelMode="note" />);
      // Should render note text inside dots — A minor has notes A, C, E
      const { container } = render(
        <ChordBox voicing={AM_VOICING} tuning={GUITAR_TUNING} labelMode="note" />,
      );
      const texts = Array.from(container.querySelectorAll('text')).map((t) => t.textContent);
      expect(texts).toContain('E'); // D string fret 2 = E3
      expect(texts).toContain('A'); // G string fret 2 = A3
      expect(texts).toContain('C'); // B string fret 1 = C4
    });

    it('shows interval labels inside dots when labelMode is interval', () => {
      const intervalMap = { A: 'R', C: 'b3', E: '5' };
      const { container } = render(
        <ChordBox
          voicing={AM_VOICING}
          tuning={GUITAR_TUNING}
          labelMode="interval"
          intervalMap={intervalMap}
          root="A"
        />,
      );
      const texts = Array.from(container.querySelectorAll('text')).map((t) => t.textContent);
      expect(texts).toContain('b3'); // C note
      expect(texts).toContain('5');  // E note
    });

    it('shows no labels inside dots when labelMode is none', () => {
      const { container } = render(
        <ChordBox voicing={AM_VOICING} tuning={GUITAR_TUNING} labelMode="none" />,
      );
      // No text inside dot groups (only the optional chord label text might exist)
      const dotTexts = Array.from(
        container.querySelectorAll('[data-testid^="chord-box-dot"] text'),
      );
      expect(dotTexts).toHaveLength(0);
    });
  });

  describe('chord label', () => {
    it('renders a label text when label prop is provided', () => {
      render(
        <ChordBox voicing={AM_VOICING} tuning={GUITAR_TUNING} label="Am" />,
      );
      expect(screen.getByTestId('chord-box-label')).toHaveTextContent('Am');
    });

    it('does not render a label when label prop is omitted', () => {
      render(<ChordBox voicing={AM_VOICING} tuning={GUITAR_TUNING} />);
      expect(screen.queryByTestId('chord-box-label')).not.toBeInTheDocument();
    });
  });

  describe('different fret windows', () => {
    it('renders with a 5-fret window', () => {
      render(<ChordBox voicing={AM_VOICING} tuning={GUITAR_TUNING} fretWindow={5} />);
      expect(screen.getByTestId('chord-box')).toBeInTheDocument();
    });

    it('adjusts height for different fret windows', () => {
      const { container: c4 } = render(
        <ChordBox voicing={AM_VOICING} tuning={GUITAR_TUNING} fretWindow={4} />,
      );
      const { container: c5 } = render(
        <ChordBox voicing={AM_VOICING} tuning={GUITAR_TUNING} fretWindow={5} />,
      );
      const h4 = Number(c4.querySelector('svg')?.getAttribute('height'));
      const h5 = Number(c5.querySelector('svg')?.getAttribute('height'));
      expect(h5).toBeGreaterThan(h4);
    });
  });
});
