import type { ChordVoicing } from './chordVoicing';
import guitarDb from '@tombatossals/chords-db/lib/guitar.json';

/**
 * Shape of a single position entry in the chords-db JSON.
 */
interface ChordsDbPosition {
  frets: number[];
  fingers: number[];
  baseFret: number;
  barres: number[];
  capo?: boolean;
  midi: number[];
}

interface ChordsDbChord {
  key: string;
  suffix: string;
  positions: ChordsDbPosition[];
}

/**
 * Map our chord type names (from tonal) to chords-db suffix names.
 * Extended as needed — this covers the diatonic triads.
 */
const SUFFIX_MAP: Record<string, string> = {
  major: 'major',
  minor: 'minor',
  diminished: 'dim',
  augmented: 'aug',
  'dominant seventh': '7',
  'major seventh': 'maj7',
  'minor seventh': 'm7',
  'suspended second': 'sus2',
  'suspended fourth': 'sus4',
};

/**
 * Map our root note names to chords-db key names.
 * chords-db uses: C, Csharp, D, Eb, E, F, Fsharp, G, Ab, A, Bb, B
 * (Note: C# and F# are stored as "Csharp" and "Fsharp" in the JSON keys.)
 * tonal may return enharmonic variants like D#, G#, A# — map those too.
 */
function normalizeKey(root: string): string {
  const KEY_MAP: Record<string, string> = {
    'C#': 'Csharp',
    'D#': 'Eb',
    'F#': 'Fsharp',
    'G#': 'Ab',
    'A#': 'Bb',
    Db: 'Csharp',
    Gb: 'Fsharp',
    Cb: 'B',
    Fb: 'E',
    'E#': 'F',
    'B#': 'C',
  };
  return KEY_MAP[root] ?? root;
}

/**
 * Convert a chords-db position entry to our ChordVoicing interface.
 *
 * chords-db stores frets *relative* to baseFret:
 *   -1 = muted, 0 = open, 1+ = offset from baseFret
 * Our ChordVoicing uses *absolute* fret numbers:
 *   null = muted, 0 = open, 1+ = actual fret number
 */
function toChordVoicing(pos: ChordsDbPosition): ChordVoicing {
  const strings = pos.frets.map((f) => {
    if (f === -1) return null;
    if (f === 0) return 0;
    return pos.baseFret + f - 1;
  });
  return { strings, baseFret: pos.baseFret };
}

/**
 * Look up all curated voicings for a given root + chord type from chords-db.
 *
 * @param root  Pitch-class root, e.g. 'C', 'F#', 'Bb'
 * @param type  Chord type name (tonal naming), e.g. 'major', 'minor', 'diminished'
 * @returns     Array of ChordVoicing, sorted by baseFret ascending. Empty if not found.
 */
export function lookupVoicings(root: string, type: string): ChordVoicing[] {
  const key = normalizeKey(root);
  const suffix = SUFFIX_MAP[type] ?? type;

  const chords = (guitarDb.chords as Record<string, ChordsDbChord[]>)[key];
  if (!chords) return [];

  const match = chords.find((c) => c.suffix === suffix);
  if (!match) return [];

  return match.positions.map(toChordVoicing);
}

/**
 * Find the curated voicing whose baseFret is closest to (but >= ) targetFret.
 * If no voicing starts at or above targetFret, returns the highest available.
 * Returns null if no voicings exist.
 */
export function lookupVoicingNear(
  root: string,
  type: string,
  targetFret: number,
): ChordVoicing | null {
  const all = lookupVoicings(root, type);
  if (all.length === 0) return null;

  // Find the first voicing at or above targetFret
  const atOrAbove = all.filter((v) => v.baseFret >= targetFret);
  if (atOrAbove.length > 0) return atOrAbove[0];

  // Fallback: return the highest available voicing
  return all[all.length - 1];
}

/**
 * Compute the absolute fret span of a voicing.
 * Returns { minFret, maxFret } considering only fretted (non-open, non-muted) strings.
 * Returns null if no fretted strings exist.
 */
export function voicingFretSpan(
  voicing: ChordVoicing,
): { minFret: number; maxFret: number } | null {
  const fretted = voicing.strings.filter((f): f is number => f !== null && f > 0);
  if (fretted.length === 0) return null;
  return { minFret: Math.min(...fretted), maxFret: Math.max(...fretted) };
}
