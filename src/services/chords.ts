import { Chord as TonalChord, ChordType, Scale as TonalScale } from 'tonal';

export interface ChordInfo {
  name: string;
  symbol: string;
  notes: string[];
  intervals: string[];
  quality: string;
}

/**
 * Get all available chord type names.
 */
export function getChordTypeNames(): string[] {
  return ChordType.all().map((c) => c.name);
}

/**
 * Get commonly used chord types, organized by category.
 */
export function getCommonChordTypes(): Record<string, string[]> {
  return {
    Triads: ['major', 'minor', 'augmented', 'diminished'],
    Sevenths: [
      'dominant seventh',
      'major seventh',
      'minor seventh',
      'minor/major seventh',
      'diminished seventh',
      'half-diminished seventh',
    ],
    Suspended: ['suspended second', 'suspended fourth', 'suspended fourth seventh'],
    Extended: ['ninth', 'major ninth', 'minor ninth', 'eleventh', 'thirteenth'],
    Added: ['added fourth', 'sixth', 'minor sixth', 'add nine'],
    Power: ['fifth'],
  };
}

/**
 * Get chord information for a given root and chord type.
 */
export function getChord(root: string, chordType: string): ChordInfo | null {
  const chord = TonalChord.get(`${root} ${chordType}`);
  if (chord.empty) return null;

  return {
    name: chord.name,
    symbol: chord.symbol,
    notes: chord.notes,
    intervals: chord.intervals,
    quality: chord.quality,
  };
}

/**
 * Get the pitch classes for a chord.
 */
export function getChordNotes(root: string, chordType: string): string[] {
  const chord = TonalChord.get(`${root} ${chordType}`);
  if (chord.empty) return [];
  return chord.notes;
}

/**
 * The diatonic triad quality for each scale degree of the major scale.
 * Degrees: I ii iii IV V vi vii°
 */
const DIATONIC_TRIAD_TYPES = [
  'major', 'minor', 'minor', 'major', 'major', 'minor', 'diminished',
] as const;

export interface DiatonicChord {
  /** Scale-degree root note, e.g. 'D' */
  root: string;
  /** Chord quality, e.g. 'minor' */
  type: string;
  /** Chord symbol, e.g. 'Dm' */
  symbol: string;
  /** Pitch-class notes, e.g. ['D', 'F', 'A'] */
  notes: string[];
  /** Intervals relative to chord root, e.g. ['1P', '3m', '5P'] */
  intervals: string[];
}

/**
 * Return the 7 diatonic triads of a major scale.
 */
export function getDiatonicChords(scaleRoot: string): DiatonicChord[] {
  const scale = TonalScale.get(`${scaleRoot} major`);
  if (scale.empty) return [];

  return scale.notes.map((note, i) => {
    const type = DIATONIC_TRIAD_TYPES[i];
    const chord = TonalChord.get(`${note} ${type}`);
    return {
      root: note,
      type,
      symbol: chord.symbol,
      notes: chord.notes,
      intervals: chord.intervals,
    };
  });
}
