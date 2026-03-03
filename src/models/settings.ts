export interface UserSettings {
  instrumentId: string;
  tuning: string[];
  fretCount: number;
  showNoteNames: boolean;
  lastScale: { root: string; type: string } | null;
  lastChords: Array<{ root: string; type: string; position: number }>;
}

export const DEFAULT_SETTINGS: UserSettings = {
  instrumentId: 'guitar',
  tuning: ['E2', 'A2', 'D3', 'G3', 'B3', 'E4'],
  fretCount: 15,
  showNoteNames: true,
  lastScale: null,
  lastChords: [],
};
