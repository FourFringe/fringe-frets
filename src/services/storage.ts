import type { UserSettings } from '../models/settings';
import { DEFAULT_SETTINGS } from '../models/settings';

const STORAGE_KEY = 'fringe-frets-settings';

/**
 * Load user settings from localStorage.
 * Returns defaults if nothing is stored or if parsing fails.
 */
export function loadSettings(): UserSettings {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return { ...DEFAULT_SETTINGS };
    return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

/**
 * Save user settings to localStorage.
 */
export function saveSettings(settings: UserSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // localStorage might be full or unavailable — silently ignore
  }
}

/**
 * Clear stored settings and return to defaults.
 */
export function clearSettings(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // silently ignore
  }
}
