import { Scale as TonalScale, ScaleType, Interval } from 'tonal';

export interface ScaleInfo {
  name: string;
  notes: string[];
  intervals: string[];
  type: string;
}

/**
 * Get all available scale type names.
 */
export function getScaleTypeNames(): string[] {
  return ScaleType.all().map((s) => s.name);
}

/**
 * Get commonly used scale types, organized by category.
 */
export function getCommonScaleTypes(): Record<string, string[]> {
  return {
    'Major / Minor': ['major', 'minor', 'harmonic minor', 'melodic minor'],
    Modes: ['dorian', 'phrygian', 'lydian', 'mixolydian', 'aeolian', 'locrian'],
    Pentatonic: ['major pentatonic', 'minor pentatonic'],
    Blues: ['blues', 'major blues'],
    Other: ['whole tone', 'diminished', 'chromatic', 'augmented'],
  };
}

/**
 * Get scale information for a given root and scale type.
 */
export function getScale(root: string, scaleType: string): ScaleInfo | null {
  const scale = TonalScale.get(`${root} ${scaleType}`);
  if (scale.empty) return null;

  return {
    name: scale.name,
    notes: scale.notes,
    intervals: scale.intervals,
    type: scale.type,
  };
}

/**
 * Get the pitch classes (note names without octave) for a scale.
 */
export function getScaleNotes(root: string, scaleType: string): string[] {
  const scale = TonalScale.get(`${root} ${scaleType}`);
  if (scale.empty) return [];
  return scale.notes;
}

/**
 * Format scale notes with visual separators that reflect step size:
 *   ' - ' between notes a whole step (2 semitones) apart
 *   ' '   between notes a half step (1 semitone) apart
 *
 * The root is repeated at the end to show the full octave.
 *
 * Example — C major: "C - D - E F - G - A - B C"
 */
export function formatScaleNotes(notes: string[], intervals: string[]): string {
  if (notes.length === 0) return '';

  const semitones = intervals.map((iv) => Interval.semitones(iv) ?? 0);

  let result = notes[0];
  for (let i = 1; i < notes.length; i++) {
    const step = semitones[i] - semitones[i - 1];
    result += step <= 1 ? ' ' : ' - ';
    result += notes[i];
  }

  // Octave closure: distance from last note back to the root
  const lastStep = 12 - (semitones[semitones.length - 1] ?? 0);
  result += lastStep <= 1 ? ' ' : ' - ';
  result += notes[0];

  return result;
}
