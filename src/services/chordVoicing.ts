import { Note } from 'tonal';

/**
 * A single-string entry in a chord voicing.
 *   null  = muted (X)
 *   0     = open string (O)
 *   1+    = fret number to press
 */
export type StringFret = number | null;

/**
 * Represents a guitar chord voicing — one fret value per string.
 *
 * `strings` is ordered from lowest-pitched string (index 0) to highest.
 * `baseFret` is the position label shown beside the diagram:
 *   - 1  → open position (show the nut at top)
 *   - 2+ → partial position (no nut; show a "2fr" type label)
 */
export interface ChordVoicing {
  strings: StringFret[];
  baseFret: number;
}

/**
 * Return the pitch-class chroma (0-11) at (openNote, fret).
 * Returns null if the open-string note can't be parsed.
 */
function chromaAt(openNote: string, fret: number): number | null {
  const openMidi = Note.midi(openNote);
  if (openMidi === null) return null;
  const midi = openMidi + fret;
  return midi % 12;
}

/**
 * Find a chord voicing within a specific fret window.
 *
 * @param pitchClasses  Pitch classes that belong to the chord (e.g. ["C","E","G"]).
 * @param tuning        Open-string notes, low-to-high (e.g. ["E2","A2","D3","G3","B3","E4"]).
 * @param windowStart   First fret included in the window (1-based; use 1 for open position).
 * @param windowSize    Number of frets in the window (typically 4).
 * @returns A ChordVoicing, or null if fewer than 3 strings can be assigned.
 */
export function findVoicingInWindow(
  pitchClasses: string[],
  tuning: string[],
  windowStart: number,
  windowSize: number,
): ChordVoicing | null {
  if (pitchClasses.length === 0) return null;

  const targetChromas = new Set(
    pitchClasses.map((pc) => Note.chroma(pc)).filter((c): c is number => c !== null),
  );

  const strings: StringFret[] = tuning.map((openNote) => {
    // Open string only in open position (windowStart === 1)
    if (windowStart === 1) {
      const openChroma = chromaAt(openNote, 0);
      if (openChroma !== null && targetChromas.has(openChroma)) {
        return 0;
      }
    }

    // Search frets in window (lowest match wins)
    for (let fret = windowStart; fret < windowStart + windowSize; fret++) {
      const chroma = chromaAt(openNote, fret);
      if (chroma !== null && targetChromas.has(chroma)) {
        return fret;
      }
    }

    return null; // muted
  });

  const activeCount = strings.filter((f) => f !== null).length;
  if (activeCount < 3) return null;

  return { strings, baseFret: windowStart };
}

/**
 * Suggest multiple chord voicings spread across the neck.
 *
 * Tries windows starting at frets 1, 2, 3, …, up to fret 12, and returns
 * up to `maxVoicings` valid results sorted by baseFret.
 *
 * @param pitchClasses  Pitch classes of the chord.
 * @param tuning        Open-string notes, low-to-high.
 * @param windowSize    Fret window size to consider per voicing (default 4).
 * @param maxVoicings   Maximum voicings to return (default 5).
 */
export function suggestVoicings(
  pitchClasses: string[],
  tuning: string[],
  windowSize = 4,
  maxVoicings = 5,
): ChordVoicing[] {
  const results: ChordVoicing[] = [];

  for (let start = 1; start <= 12 && results.length < maxVoicings; start++) {
    const voicing = findVoicingInWindow(pitchClasses, tuning, start, windowSize);
    if (voicing !== null) {
      results.push(voicing);
    }
  }

  return results;
}

/**
 * Return the pitch-class note name played at a given (string, fret) position.
 * Returns null if the string note is invalid.
 */
export function noteAtPosition(openNote: string, fret: number | null): string | null {
  if (fret === null) return null;
  const openMidi = Note.midi(openNote);
  if (openMidi === null) return null;
  const midi = openMidi + fret;
  const name = Note.fromMidi(midi);
  return Note.get(name).pc ?? null;
}
