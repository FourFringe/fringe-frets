import { describe, it, expect, beforeEach } from 'vitest';
import { loadSettings, saveSettings, clearSettings } from '../../src/services/storage';
import { DEFAULT_SETTINGS } from '../../src/models/settings';

describe('storage service', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns default settings when nothing is stored', () => {
    const settings = loadSettings();
    expect(settings).toEqual(DEFAULT_SETTINGS);
  });

  it('round-trips settings through save and load', () => {
    const custom = { ...DEFAULT_SETTINGS, instrumentId: 'bass', fretCount: 24 };
    saveSettings(custom);

    const loaded = loadSettings();
    expect(loaded.instrumentId).toBe('bass');
    expect(loaded.fretCount).toBe(24);
  });

  it('clears saved settings', () => {
    saveSettings({ ...DEFAULT_SETTINGS, instrumentId: 'mandolin' });
    clearSettings();

    const loaded = loadSettings();
    expect(loaded).toEqual(DEFAULT_SETTINGS);
  });

  it('falls back to defaults on corrupted data', () => {
    localStorage.setItem('fringe-frets-settings', 'not valid json!');
    const loaded = loadSettings();
    expect(loaded).toEqual(DEFAULT_SETTINGS);
  });
});
