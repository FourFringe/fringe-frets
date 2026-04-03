import { Note } from 'tonal';
import { buildFretboard } from './fretboard';

/**
 * Find starting fret positions where every note of a scale can be played
 * within a window of consecutive frets.
 *
 * The algorithm scans from fret 0 to `maxFret`, checking each window of
 * `windowSize` frets. A window is valid when every pitch class in
 * `scaleNotes` appears on at least one string within the window.
 *
 * Positions are selected greedily so that consecutive positions are at least
 * `minGap` frets apart.
 *
 * Note: the caller may choose to display an extra fret above each position
 * to capture notes that spill over on individual strings.
 */
export function findScalePositions(
  tuning: string[],
  scaleNotes: string[],
  maxFret: number = 15,
  windowSize: number = 4,
  minGap: number = 2,
): number[] {
  if (scaleNotes.length === 0) return [];

  const fretboard = buildFretboard(tuning, maxFret);
  const scaleChromaSet = new Set(
    scaleNotes
      .map((n) => Note.chroma(n))
      .filter((c): c is number => c !== null),
  );

  // Find all valid starting fret positions
  const validStarts: number[] = [];
  for (let s = 0; s <= maxFret - windowSize + 1; s++) {
    const hi = s + windowSize - 1;

    const found = new Set<number>();
    for (const stringPositions of fretboard) {
      for (const pos of stringPositions) {
        if (pos.fret >= s && pos.fret <= hi) {
          const chroma = Note.chroma(pos.note);
          if (chroma !== null && scaleChromaSet.has(chroma)) {
            found.add(chroma);
          }
        }
      }
    }

    if (found.size === scaleChromaSet.size) {
      validStarts.push(s);
    }
  }

  // Greedily select positions at least minGap frets apart
  const selected: number[] = [];
  for (const s of validStarts) {
    if (selected.length === 0 || s - selected[selected.length - 1] >= minGap) {
      selected.push(s);
    }
  }

  return selected;
}
