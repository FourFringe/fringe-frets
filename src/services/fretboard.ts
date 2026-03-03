import { Note } from 'tonal';
import type { FretPosition } from '../models/music';

/**
 * Get the note name (without octave) at a given string and fret position.
 * The open string note is transposed up by the number of fret semitones.
 */
export function getNoteAtFret(openStringNote: string, fret: number): string {
  if (fret === 0) return openStringNote;
  return Note.transpose(openStringNote, fret === 1 ? 'm2' : `${fret}m2`.replace(/\d+/, String(fret))) ?? openStringNote;
}

/**
 * Compute the note at a specific (string, fret) position using semitone transposition.
 */
export function getNoteAtPosition(openStringNote: string, fret: number): FretPosition {
  // Use MIDI math for reliable transposition
  const openMidi = Note.midi(openStringNote);
  if (openMidi === null) {
    throw new Error(`Invalid note: ${openStringNote}`);
  }
  const midi = openMidi + fret;
  const noteName = Note.fromMidi(midi);
  const parsed = Note.get(noteName);

  return {
    string: 0, // caller sets this
    fret,
    note: parsed.pc ?? noteName,
    octave: parsed.oct ?? 0,
    midi,
  };
}

/**
 * Build a complete fretboard map: for each string and fret, what note is there?
 */
export function buildFretboard(
  tuning: string[],
  fretCount: number,
): FretPosition[][] {
  return tuning.map((openNote, stringIndex) => {
    const positions: FretPosition[] = [];
    for (let fret = 0; fret <= fretCount; fret++) {
      const pos = getNoteAtPosition(openNote, fret);
      pos.string = stringIndex;
      positions.push(pos);
    }
    return positions;
  });
}

/**
 * Filter fretboard positions to only those matching a set of pitch classes (e.g. scale notes).
 */
export function filterByPitchClasses(
  fretboard: FretPosition[][],
  pitchClasses: string[],
): FretPosition[] {
  const pcSet = new Set(pitchClasses.map((pc) => Note.chroma(pc)));
  const matches: FretPosition[] = [];

  for (const stringPositions of fretboard) {
    for (const pos of stringPositions) {
      const chroma = Note.chroma(pos.note);
      if (chroma !== null && pcSet.has(chroma)) {
        matches.push(pos);
      }
    }
  }

  return matches;
}
