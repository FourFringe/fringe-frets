import { useState, useCallback, useEffect } from 'react';
import type { UserSettings } from '../models/settings';
import { DEFAULT_SETTINGS } from '../models/settings';
import { loadSettings, saveSettings } from '../services/storage';

/**
 * Hook for managing user settings with localStorage persistence.
 */
export function useSettings() {
  const [settings, setSettingsState] = useState<UserSettings>(() => loadSettings());

  // Persist whenever settings change
  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  const updateSettings = useCallback((patch: Partial<UserSettings>) => {
    setSettingsState((prev) => ({ ...prev, ...patch }));
  }, []);

  const resetSettings = useCallback(() => {
    setSettingsState({ ...DEFAULT_SETTINGS });
  }, []);

  return { settings, updateSettings, resetSettings };
}
