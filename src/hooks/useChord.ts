import { useMemo } from 'react';
import { getChord } from '../services/chords';
import { buildIntervalMap } from '../services/intervals';
import { buildFretboard, filterByPitchClasses } from '../services/fretboard';
import type { FretPosition } from '../models/music';
import type { ChordInfo } from '../services/chords';

interface UseChordResult {
  chord: ChordInfo | null;
  notes: string[];
  intervals: string[];
  intervalMap: Record<string, string>;
  highlightedPositions: FretPosition[];
}

/**
 * Hook that computes chord notes and their positions on the fretboard.
 */
export function useChord(
  root: string,
  chordType: string,
  tuning: string[],
  fretCount: number,
): UseChordResult {
  return useMemo(() => {
    const chord = getChord(root, chordType);
    const notes = chord?.notes ?? [];
    const intervals = chord?.intervals ?? [];
    const intervalMap = notes.length > 0 ? buildIntervalMap(notes, intervals) : {};
    const fretboard = buildFretboard(tuning, fretCount);
    const highlightedPositions = notes.length > 0 ? filterByPitchClasses(fretboard, notes) : [];

    return {
      chord,
      notes,
      intervals,
      intervalMap,
      highlightedPositions,
    };
  }, [root, chordType, tuning, fretCount]);
}
