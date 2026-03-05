export interface UserSettings {
  instrumentId: string;
  tuning: string[];
  fretCount: number;
  showNoteNames: boolean;
  lastScale: { root: string; type: string } | null;
  lastChords: Array<{ root: string; type: string; position: number }>;
  scaleStartFret: number;
  scaleEndFret: number;
  scaleOrientation: 'horizontal' | 'vertical';
  scaleModesRoot: string;
  scaleModesStartFret: number;
  scaleModesEndFret: number;
}

export const DEFAULT_SETTINGS: UserSettings = {
  instrumentId: 'guitar',
  tuning: ['E2', 'A2', 'D3', 'G3', 'B3', 'E4'],
  fretCount: 24,
  showNoteNames: true,
  lastScale: null,
  lastChords: [],
  scaleStartFret: 0,
  scaleEndFret: 24,
  scaleOrientation: 'horizontal',
  scaleModesRoot: 'C',
  scaleModesStartFret: 0,
  scaleModesEndFret: 12,
};
