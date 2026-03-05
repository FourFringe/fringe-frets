import { Note } from 'tonal';
import { NOTE_NAMES, FLAT_NOTE_NAMES } from '../models/music';

/**
 * Return the simplified (fewer-accidentals) spelling of a note, falling back
 * to the original if tonal cannot simplify it.
 *
 * Examples:
 *   simplifyNote('E#')  → 'F'
 *   simplifyNote('B#')  → 'C'
 *   simplifyNote('C##') → 'D'
 *   simplifyNote('C')   → 'C'
 */
export function simplifyNote(note: string): string {
  return Note.simplify(note) || note;
}

/**
 * Returns true when two note names (pitch classes or note+octave) refer to the
 * same pitch regardless of enharmonic spelling.
 *
 * Examples:
 *   isSameNote('E#', 'F')  → true
 *   isSameNote('C', 'B#')  → true
 *   isSameNote('C', 'D')   → false
 */
export function isSameNote(a: string, b: string): boolean {
  const ca = Note.chroma(a);
  const cb = Note.chroma(b);
  return ca !== null && cb !== null && ca === cb;
}

// ── Enharmonic display labels ─────────────────────────────────────────────────
//
// Build a map from any accidental pitch class to its "♯/♭" display string
// by pairing NOTE_NAMES (sharps) with FLAT_NOTE_NAMES (flats) at the same
// chroma index.  Both spellings map to the same label so callers don't need
// to know which convention to look up.
//
// E.g.:
//   'C#' → 'C♯/D♭'
//   'Db' → 'C♯/D♭'
//   'Bb' → 'A♯/B♭'

const _enharmonicDisplayMap: Record<string, string> = {};
for (let i = 0; i < 12; i++) {
  if (NOTE_NAMES[i] !== FLAT_NOTE_NAMES[i]) {
    const sharp = NOTE_NAMES[i].replace('#', '♯');
    const flat  = FLAT_NOTE_NAMES[i].replace('b', '♭');
    const label = `${sharp}/${flat}`;
    _enharmonicDisplayMap[NOTE_NAMES[i]]     = label;
    _enharmonicDisplayMap[FLAT_NOTE_NAMES[i]] = label;
  }
}

/**
 * Return a display string for accidental pitch classes showing both sharp and
 * flat spellings (e.g. "C♯/D♭"), or null for natural notes.
 *
 * Handles both sharp-based and flat-based input:
 *   enharmonicDisplayLabel('C#') → 'C♯/D♭'
 *   enharmonicDisplayLabel('Db') → 'C♯/D♭'
 *   enharmonicDisplayLabel('C')  → null
 */
export function enharmonicDisplayLabel(pc: string): string | null {
  return _enharmonicDisplayMap[pc] ?? null;
}
