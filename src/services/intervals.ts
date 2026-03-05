import { simplifyNote } from './notes';

/**
 * Short display labels for intervals, as musicians typically write them.
 *
 * Tonal returns intervals in scientific notation like "1P", "3M", "5P".
 * We convert to shorthand: "R", "2", "b3", "3", "4", "#4", "5", "b6", "6", "b7", "7", etc.
 */
const INTERVAL_LABELS: Record<string, string> = {
  '1P': 'R',
  '2m': 'b2',
  '2M': '2',
  '2A': '#2',
  '3m': 'b3',
  '3M': '3',
  '4d': 'b4',
  '4P': '4',
  '4A': '#4',
  '5d': 'b5',
  '5P': '5',
  '5A': '#5',
  '6m': 'b6',
  '6M': '6',
  '6A': '#6',
  '7m': 'b7',
  '7M': '7',
  '8P': 'R',
  '9m': 'b9',
  '9M': '9',
  '9A': '#9',
  '10m': 'b10',
  '10M': '10',
  '11P': '11',
  '11A': '#11',
  '12d': 'b12',
  '12P': '12',
  '13m': 'b13',
  '13M': '13',
};

/**
 * Convert a tonal interval (e.g. "3M") to a short musician-friendly label (e.g. "3").
 * Returns the interval name itself if no mapping exists.
 */
export function intervalLabel(interval: string): string {
  return INTERVAL_LABELS[interval] ?? interval;
}

/**
 * Build a map from pitch class → interval label, given a root, a list of
 * pitch classes (notes), and the corresponding interval list from tonal.
 *
 * Entries are indexed by BOTH the tonal spelling (e.g. "E#") AND its
 * simplified enharmonic equivalent (e.g. "F"), so lookups based on
 * fretboard positions (which always use simplified sharps/naturals) work
 * regardless of the scale's accidental convention.
 *
 * Example: buildIntervalMap(['C', 'E', 'G'], ['1P', '3M', '5P'])
 *          → { C: 'R', E: '3', G: '5' }
 */
export function buildIntervalMap(
  notes: string[],
  intervals: string[],
): Record<string, string> {
  const map: Record<string, string> = {};
  for (let i = 0; i < notes.length; i++) {
    const label = intervalLabel(intervals[i]);
    map[notes[i]] = label;
    // Also index by the simplified enharmonic spelling so the lookup works
    // when the fretboard uses a different accidental (e.g. E# → F, B# → C).
    const simplified = simplifyNote(notes[i]);
    if (simplified !== notes[i]) {
      map[simplified] = label;
    }
  }
  return map;
}
