import { NavLink, Outlet } from 'react-router';
import { Select } from '@mantine/core';
import { Note } from 'tonal';
import { INSTRUMENTS } from '../../models/instrument';
import type { UserSettings } from '../../models/settings';
import styles from './AppShell.module.css';

interface AppShellProps {
  settings: UserSettings;
  onUpdateSettings: (patch: Partial<UserSettings>) => void;
}

const instrumentOptions = [
  { group: 'Instruments', items: [
    { value: 'guitar', label: 'Guitar' },
    { value: 'mandolin', label: 'Mandolin' },
  ]},
  { group: 'Scales Only', items: [
    { value: 'bass', label: 'Bass' },
    { value: 'violin', label: 'Violin' },
    { value: 'cello', label: 'Cello' },
  ]},
];

export function AppShell({ settings, onUpdateSettings }: AppShellProps) {
  const handleInstrumentChange = (value: string | null) => {
    if (!value) return;
    const instrument = INSTRUMENTS[value];
    if (instrument) {
      onUpdateSettings({
        instrumentId: value,
        tuning: instrument.defaultTuning,
        fretCount: Math.min(settings.fretCount, instrument.fretCount),
      });
    }
  };

  return (
    <div className={styles.appShell}>
      <nav className={styles.sidebar}>
        <div className={styles.sidebarTitle}>Fringe Frets</div>
        <div className={styles.sidebarSubtitle}>Fretboard Explorer</div>

        <div className={styles.navLinks}>
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`
            }
          >
            Home
          </NavLink>

          <div className={styles.navSection}>Explore</div>
          <NavLink
            to="/scales"
            className={({ isActive }) =>
              `${styles.navLink} ${styles.navLinkIndent} ${isActive ? styles.navLinkActive : ''}`
            }
          >
            Scale Explorer
          </NavLink>
          <NavLink
            to="/chords"
            className={({ isActive }) =>
              `${styles.navLink} ${styles.navLinkIndent} ${isActive ? styles.navLinkActive : ''}`
            }
          >
            Chord Explorer
          </NavLink>

          <div className={styles.navSection}>Modes</div>
          <NavLink
            to="/modes"
            className={({ isActive }) =>
              `${styles.navLink} ${styles.navLinkIndent} ${isActive ? styles.navLinkActive : ''}`
            }
          >
            Mode Scales
          </NavLink>
          <NavLink
            to="/mode-chords"
            className={({ isActive }) =>
              `${styles.navLink} ${styles.navLinkIndent} ${isActive ? styles.navLinkActive : ''}`
            }
          >
            Mode Chords
          </NavLink>
        </div>

        <hr className={styles.sidebarDivider} />

        <Select
          label="Instrument"
          data={instrumentOptions}
          value={settings.instrumentId}
          onChange={handleInstrumentChange}
          size="sm"
        />

        <div className={styles.tuningDisplay}>
          <span className={styles.tuningLabel}>Tuning</span>
          <span className={styles.tuningNotes}>
            {(settings.tuning ?? INSTRUMENTS[settings.instrumentId]?.defaultTuning ?? [])
              .map((n) => Note.pitchClass(n) || n)
              .join(' ')}
          </span>
        </div>
      </nav>

      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}
