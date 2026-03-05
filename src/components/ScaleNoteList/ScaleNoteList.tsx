import { Interval } from 'tonal';
import styles from './ScaleNoteList.module.css';

interface ScaleNoteListProps {
  notes: string[];
  intervals: string[];
  intervalMap: Record<string, string>;
}

/**
 * Renders a scale's notes inline with their interval labels stacked below,
 * using a thicker separator (—) for whole steps and a thin one (·) for half steps.
 *
 * Example for C major:
 *   C — D — E · F — G — A — B
 *   R   2   3   4   5   6   7
 */
export function ScaleNoteList({ notes, intervals, intervalMap }: ScaleNoteListProps) {
  if (notes.length === 0) return null;

  const semitones = intervals.map((iv) => Interval.semitones(iv) ?? 0);

  return (
    <span className={styles.noteList}>
      {notes.map((note, i) => (
        <span key={`${note}-${i}`} className={styles.item}>
          {i > 0 && (
            <span
              className={
                semitones[i] - semitones[i - 1] <= 1
                  ? styles.halfStep
                  : styles.wholeStep
              }
            >
              {semitones[i] - semitones[i - 1] <= 1 ? '·' : '—'}
            </span>
          )}
          <span className={styles.noteItem}>
            <span className={styles.noteName}>{note}</span>
            <span className={styles.intervalLabel}>{intervalMap[note] ?? ''}</span>
          </span>
        </span>
      ))}
    </span>
  );
}
