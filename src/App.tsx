import { BrowserRouter, Routes, Route } from 'react-router';
import { AppShell } from './components/layout/AppShell';
import { Home } from './pages/Home/Home';
import { ScaleExplorer } from './pages/ScaleExplorer/ScaleExplorer';
import { ScaleModes } from './pages/ScaleModes/ScaleModes';
import { ChordBuilder } from './pages/ChordBuilder/ChordBuilder';
import { TabViewer } from './pages/TabViewer/TabViewer';
import { useSettings } from './hooks/useSettings';
import { useInstrument } from './hooks/useInstrument';

export default function App() {
  const { settings, updateSettings } = useSettings();
  const instrument = useInstrument(settings.instrumentId);

  return (
    <BrowserRouter>
      <Routes>
        <Route
          element={<AppShell settings={settings} onUpdateSettings={updateSettings} />}
        >
          <Route index element={<Home />} />
          <Route
            path="scales"
            element={
              <ScaleExplorer
                tuning={settings.tuning ?? instrument.defaultTuning}
                fretCount={settings.fretCount}
                initialFretRange={[settings.scaleStartFret, settings.scaleEndFret]}
                onFretRangeChange={([start, end]) =>
                  updateSettings({ scaleStartFret: start, scaleEndFret: end })
                }
                initialOrientation={settings.scaleOrientation}
                onOrientationChange={(o) => updateSettings({ scaleOrientation: o })}
              />
            }
          />
          <Route
            path="modes"
            element={
              <ScaleModes
                tuning={settings.tuning ?? instrument.defaultTuning}
                fretCount={settings.fretCount}
                initialRoot={settings.scaleModesRoot}
                onRootChange={(r) => updateSettings({ scaleModesRoot: r })}
                initialFretRange={[settings.scaleModesStartFret, settings.scaleModesEndFret]}
                onFretRangeChange={([start, end]) =>
                  updateSettings({ scaleModesStartFret: start, scaleModesEndFret: end })
                }
              />
            }
          />
          <Route
            path="chords"
            element={
              <ChordBuilder
                tuning={settings.tuning ?? instrument.defaultTuning}
                fretCount={settings.fretCount}
              />
            }
          />
          <Route path="tabs" element={<TabViewer />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
