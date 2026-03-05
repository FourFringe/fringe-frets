import { Scale as TonalScale, ScaleType } from 'tonal';

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

