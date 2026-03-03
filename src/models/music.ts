export interface FretPosition {
  string: number;
  fret: number;
  note: string;
  octave: number;
  midi: number;
}

export interface ScaleSelection {
  root: string;
  type: string;
}

export interface ChordSelection {
  root: string;
  type: string;
  position: number;
}

export const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export const FLAT_NOTE_NAMES = [
  'C',
  'Db',
  'D',
  'Eb',
  'E',
  'F',
  'Gb',
  'G',
  'Ab',
  'A',
  'Bb',
  'B',
];
