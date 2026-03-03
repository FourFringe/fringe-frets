import { useMemo } from 'react';
import { getScale } from '../services/scales';
import { buildFretboard, filterByPitchClasses } from '../services/fretboard';
import type { FretPosition } from '../models/music';

interface UseScaleResult {
  notes: string[];
  scaleName: string | null;
  fretboard: FretPosition[][];
  highlightedPositions: FretPosition[];
}

/**
 * Hook that computes scale notes and their positions on the fretboard.
 */
export function useScale(
  root: string,
  scaleType: string,
  tuning: string[],
  fretCount: number,
): UseScaleResult {
  return useMemo(() => {
    const scaleInfo = getScale(root, scaleType);
    const notes = scaleInfo ? scaleInfo.notes : [];
    const fretboard = buildFretboard(tuning, fretCount);
    const highlightedPositions = notes.length > 0 ? filterByPitchClasses(fretboard, notes) : [];

    return {
      notes,
      scaleName: scaleInfo?.name ?? null,
      fretboard,
      highlightedPositions,
    };
  }, [root, scaleType, tuning, fretCount]);
}
