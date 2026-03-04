export interface Instrument {
  id: string;
  name: string;
  strings: number;
  defaultTuning: string[];
  fretCount: number;
}

export const INSTRUMENTS: Record<string, Instrument> = {
  guitar: {
    id: 'guitar',
    name: 'Guitar',
    strings: 6,
    defaultTuning: ['E2', 'A2', 'D3', 'G3', 'B3', 'E4'],
    fretCount: 24,
  },
  mandolin: {
    id: 'mandolin',
    name: 'Mandolin',
    strings: 4,
    defaultTuning: ['G3', 'D4', 'A4', 'E5'],
    fretCount: 17,
  },
  ukulele: {
    id: 'ukulele',
    name: 'Ukulele',
    strings: 4,
    defaultTuning: ['G4', 'C4', 'E4', 'A4'],
    fretCount: 15,
  },
  violin: {
    id: 'violin',
    name: 'Violin',
    strings: 4,
    defaultTuning: ['G3', 'D4', 'A4', 'E5'],
    fretCount: 12,
  },
  cello: {
    id: 'cello',
    name: 'Cello',
    strings: 4,
    defaultTuning: ['C2', 'G2', 'D3', 'A3'],
    fretCount: 12,
  },
};

export const DEFAULT_INSTRUMENT_ID = 'guitar';
