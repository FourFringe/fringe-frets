import { useMemo } from 'react';
import { INSTRUMENTS, DEFAULT_INSTRUMENT_ID } from '../models/instrument';
import type { Instrument } from '../models/instrument';

/**
 * Hook that resolves the current instrument from an ID.
 */
export function useInstrument(instrumentId: string): Instrument {
  return useMemo(() => {
    return INSTRUMENTS[instrumentId] ?? INSTRUMENTS[DEFAULT_INSTRUMENT_ID];
  }, [instrumentId]);
}
