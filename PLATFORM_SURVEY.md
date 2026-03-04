# Fringe Frets — Platform & Library Survey

*Compiled: March 2026*

---

## 1. Executive Summary

After surveying the ecosystem, **React web app** is the strongly recommended platform. The JavaScript/TypeScript ecosystem has:

- The most mature and actively maintained **music theory** library (`tonal`)
- Multiple purpose-built **guitar fretboard & chord rendering** libraries
- A world-class **music notation** renderer (`VexFlow`) for future tab/staff features
- Easy print-to-PDF via the browser's built-in print functionality
- Cross-platform reach (desktop, tablet, phone) with a single codebase

The Swift/iOS ecosystem has a decent music theory library but lacks fretboard rendering components — you'd be building all the drawing from scratch.

---

## 2. Music Theory Libraries

These handle notes, scales, chords, intervals, keys, and modes — the data layer your app depends on.

### 2.1 tonal (JavaScript/TypeScript) ⭐ RECOMMENDED

| | |
|---|---|
| **Repo** | [github.com/tonaljs/tonal](https://github.com/tonaljs/tonal) |
| **npm** | `tonal` (v6.4.3) |
| **Stars** | 4,100+ |
| **Weekly downloads** | ~7,700 |
| **Language** | TypeScript |
| **License** | MIT |
| **Last updated** | Active (commits within last 2 months) |

**Why it's ideal for this project:**

- **Comprehensive scale dictionary** — all 7 Greek modes (Ionian, Dorian, Phrygian, Lydian, Mixolydian, Aeolian, Locrian), pentatonic, blues, harmonic minor, melodic minor, whole tone, diminished, and many more via `@tonaljs/scale-type`.
- **Full chord support** — major, minor, 7th, sus2, sus4, dim, aug, add9, maj9, min7b5, etc. via `@tonaljs/chord-type`. Handles complex jazz chord symbols.
- **Chord voicings** — dedicated `@tonaljs/voicing` module with voice leading, perfect for guitar voicing exploration.
- **Key & mode awareness** — `@tonaljs/key` and `@tonaljs/mode` provide chords-in-key, harmonic fields.
- **Note transposition** — transpose any note by any interval, essential for mapping scales across frets.
- **Functional, pure API** — no mutation, easy to reason about in React.

**Example usage for your app:**
```typescript
import { Scale, Chord, Note } from "tonal";

// Get all notes in B Lydian
Scale.get("B lydian").notes;
// => ["B", "C#", "D#", "E#", "F#", "G#", "A#"]

// Get notes in a Gsus4 chord
Chord.get("Gsus4").notes;
// => ["G", "C", "D"]

// Transpose to find note at fret 5 of string tuned to E
Note.transpose("E2", "4P");
// => "A2" (perfect 4th up = 5 semitones)
```

### 2.2 teoria (JavaScript)

| | |
|---|---|
| **Repo** | [github.com/saebekassebil/teoria](https://github.com/saebekassebil/teoria) |
| **npm** | `teoria` (v2.5.0) |
| **Stars** | 1,400 |
| **Weekly downloads** | ~1,250 |
| **Language** | JavaScript (no TypeScript) |
| **License** | MIT |
| **Last updated** | 9 years ago (abandoned) |

**Assessment:** Feature-rich with notes, chords, scales (7 modes + pentatonic + blues + harmonic minor + whole tone), intervals, and solfège support. However, it's **unmaintained for 9 years**, has no TypeScript types, and uses an OOP style. The scale selection is also smaller than tonal's. Not recommended — tonal covers everything teoria does and more, with active maintenance.

### 2.3 MusicTheory (Swift/iOS)

| | |
|---|---|
| **Repo** | [github.com/cemolcay/MusicTheory](https://github.com/cemolcay/MusicTheory) |
| **Stars** | 472 |
| **License** | MIT |
| **Platforms** | iOS 8+, macOS 10.9+, tvOS, watchOS |
| **Last updated** | 2024 (release 1.6) |

**Assessment:** This is the best Swift option. Provides `Pitch`, `Key`, `Scale`, `Chord`, `Interval`, `ChordProgression`, and `HarmonicField`. The `ScaleType` enum has many built-in scales. `ChordType` supports building arbitrary chords from thirds, fifths, sevenths, and extensions. Battle-tested in several App Store apps (FretBud, KeyBud, ChordBud). Solid library, but the ecosystem around it (rendering) is thin — you'd need to build your own fretboard/chord diagram views in SwiftUI or UIKit.

### 2.4 AudioKit (Swift/iOS)

| | |
|---|---|
| **Repo** | [github.com/AudioKit/AudioKit](https://github.com/AudioKit/AudioKit) |
| **Stars** | 11,300+ |

**Assessment:** AudioKit is primarily an **audio synthesis and processing** framework, not a music theory library. It's overkill for this project — you don't need real-time audio. Mentioning it because it's the biggest Swift music project, but it doesn't help with scales/chords/fretboard data.

---

## 3. Fretboard & Chord Diagram Rendering

These are the libraries that actually draw guitar diagrams — and this is where the web platform decisively wins.

### 3.1 @moonwave99/fretboard.js ⭐ STRONG OPTION FOR SCALE DIAGRAMS

| | |
|---|---|
| **Repo** | [github.com/moonwave99/fretboard.js](https://github.com/moonwave99/fretboard.js) |
| **npm** | `@moonwave99/fretboard.js` (v0.2.13) |
| **Stars** | 95 |
| **Renders** | SVG |
| **License** | ISC |

**What it does:**
- Guitar/bass **fretboard SVG visualization** — exactly the horizontal fretboard diagram you described
- Built-in music tools: **scale boxes, arpeggios, chord shapes**
- User interaction API (click on frets, etc.)
- Configurable number of strings and frets
- Dot markers on fret positions

**Fit for your project:** This is very close to your "scale across 5–24 frets" feature. It renders the full fretboard with horizontal strings and vertical frets, with dots on scale positions. May need some customization, but it's a huge head start. Last published 3 years ago, so it may need forking for active development.

### 3.2 vexchords ⭐ STRONG OPTION FOR CHORD DIAGRAMS

| | |
|---|---|
| **Repo** | [github.com/0xfe/vexchords](https://github.com/0xfe/vexchords) |
| **npm** | `vexchords` |
| **Stars** | 918 |
| **Renders** | SVG |
| **License** | MIT |

**What it does:**
- Renders **guitar chord box diagrams** (vertical strings, horizontal frets, finger dots)
- Configurable: number of strings/frets, colors, sizes, fonts
- Supports **barre chords**, open strings, muted strings, position markers, finger labels
- Simple `draw()` API

**Fit for your project:** This is almost exactly your chord diagram feature. Pass in fret positions & barres, get a clean SVG chord box. Works great for laying out multiple chords side by side. From the same author as VexFlow.

**Example:**
```javascript
import { draw } from 'vexchords';

// F barre chord
draw('#chord1', {
  chord: [[1, 1], [2, 1], [3, 2], [4, 3], [5, 3], [6, 1]],
  barres: [{ fromString: 6, toString: 1, fret: 1 }],
  position: 1
});
```

### 3.3 react-chords

| | |
|---|---|
| **Repo** | [github.com/tombatossals/react-chords](https://github.com/tombatossals/react-chords) |
| **npm** | `@tombatossals/react-chords` |
| **Stars** | 220 |
| **Renders** | SVG |

**What it does:**
- React component for rendering guitar/ukulele chord diagrams
- Works with **chords-db** (see §4.1), a JSON database of pre-built chord fingerings
- Supports barres, capo, finger numbering

**Fit for your project:** A native React wrapper. Less flexible than vexchords but ships as a drop-in React `<Chord />` component. Useful for rapid prototyping; you might outgrow it.

### 3.4 react-guitar

| | |
|---|---|
| **Repo** | [github.com/4lejandrito/react-guitar](https://github.com/4lejandrito/react-guitar) |
| **npm** | `react-guitar` (v1.1.3) |
| **Stars** | 652 |
| **Renders** | CSS/HTML (not SVG) |

**What it does:**
- Beautiful, interactive guitar component for React
- Pass in `strings` array (fret numbers per string), renders a photorealistic-ish guitar
- Supports sound playback via `react-guitar-sound`
- Theming, left-handed mode, configurable frets
- Designed more as an **interactive instrument** than a printable diagram

**Fit for your project:** Visually impressive but renders with CSS, not SVG line drawings. Not ideal for your "line drawing" print requirement. Better suited for interactive "play along" features than printable reference sheets.

### 3.5 Swift/iOS — Nothing Available

There are no equivalent open-source fretboard or chord diagram rendering libraries for SwiftUI/UIKit. You would need to:
- Build custom `Path` drawings in SwiftUI, or
- Use `Core Graphics` / `CAShapeLayer` in UIKit
- Write all the layout math for string spacing, fret positions, dots, etc.

This is a significant amount of work that the JS ecosystem gives you for free.

---

## 4. Chord Data / Databases

### 4.1 chords-db

| | |
|---|---|
| **Repo** | [github.com/tombatossals/chords-db](https://github.com/tombatossals/chords-db) |
| **Stars** | 514 |

A JSON database of guitar and ukulele chord fingerings, with multiple voicing positions per chord. Includes fret numbers, finger assignments, barre indicators, and capo flags. Useful as a starting dataset, though for your app you'll probably want to **generate chord voicings programmatically** from tonal's chord data rather than rely on a static database — this gives you flexibility for any chord on any starting fret.

---

## 5. Music Notation (Future: Tabs & Staves)

### 5.1 VexFlow ⭐ BEST IN CLASS

| | |
|---|---|
| **Repo** | [github.com/0xfe/vexflow](https://github.com/0xfe/vexflow) |
| **npm** | `vexflow` (v4.2.6) |
| **Stars** | 4,300+ |
| **Renders** | SVG and Canvas |
| **License** | MIT |

**What it does:**
- Full **music notation rendering**: treble/bass clefs, key signatures, time signatures, notes, rests, beams, ties, accidentals — everything
- **Guitar tablature** rendering built in
- High-level `EasyScore` API for quick notation
- Low-level API for fine-grained control
- Companion **VexTab** language for text-based tab entry

**Fit for your project:** When you're ready to add guitar tablature and standard notation staves, VexFlow is the obvious choice. It's the industry standard for web-based music notation. No equivalent exists in the iOS ecosystem at this quality level.

---

## 6. Drawing / Rendering Approach

For the custom line drawing needs (fretboard diagrams, chord boxes), you have several options within a React web app:

| Approach | Pros | Cons |
|---|---|---|
| **Raw SVG in React** | Full control, print-friendly, no dependency. React renders SVG natively as JSX. | More code to write from scratch |
| **SVG.js** | Fluent API for SVG manipulation | Extra dependency, React integration needs care |
| **D3.js** | Powerful data-driven drawing | Overkill for static diagrams, fights React's DOM model |
| **HTML Canvas** | Fast rendering | Not print-friendly, not scalable like SVG |
| **Use fretboard.js + vexchords** | Purpose-built for exactly your use case | May need customization for your exact layout |

**Recommendation:** Use **SVG rendered directly in React components**. SVG is:
- Resolution-independent (scales perfectly for print)
- Natively printable via browser print / CSS `@media print`
- Easy to style with CSS
- First-class in React (write `<svg>`, `<line>`, `<circle>`, `<text>` as JSX)

You can use fretboard.js and vexchords as reference implementations or starting points, and build your own React SVG components when you need more control. This gives you the best of both worlds.

---

## 7. Printing Support

A web app has excellent print support:
- **CSS `@media print`** rules let you hide UI chrome and show only diagrams
- **SVG scales perfectly** to any paper size
- Browser "Print to PDF" works on all platforms
- You could add a **"Print Layout"** mode that arranges diagrams for A4/Letter paper
- Libraries like `react-to-print` streamline the print workflow

For iOS/macOS, you'd use `UIPrintInteractionController` (iOS) or `NSPrintOperation` (macOS), which also work but require more manual layout code.

---

## 8. Platform Comparison Matrix

| Criterion | React Web App | iOS (SwiftUI) | macOS (SwiftUI/AppKit) |
|---|---|---|---|
| **Music theory library** | `tonal` — excellent, 4.1K stars, active | `MusicTheory` — good, 472 stars | Same as iOS |
| **Fretboard rendering** | fretboard.js, vexchords, react-chords | Build from scratch | Build from scratch |
| **Chord diagrams** | vexchords, react-chords — ready-made | Build from scratch | Build from scratch |
| **Future tab/notation** | VexFlow — industry standard | Nothing comparable | Nothing comparable |
| **Print support** | Browser print + CSS @media | UIPrintInteractionController | NSPrintOperation |
| **Cross-platform** | All devices via browser | iPhone/iPad only | Mac only |
| **Multi-instrument** | Easy (configure strings/tuning) | Same effort | Same effort |
| **Offline use** | PWA (Service Worker) | Native | Native |
| **Development speed** | Fast (many libraries available) | Slower (build rendering from scratch) | Slower |
| **Distribution** | URL, no app store needed | App Store review | App Store or direct |

---

## 9. Recommendation

**Build a React web app** using:

| Layer | Library | Purpose |
|---|---|---|
| **Framework** | React + TypeScript + Vite | App shell, fast build |
| **Music theory** | `tonal` | Notes, scales, chords, intervals, voicings |
| **Fretboard diagrams** | Custom React SVG components (reference fretboard.js) | Scale visualization across configurable frets |
| **Chord diagrams** | Custom React SVG components (reference vexchords) | Chord box rendering with finger dots, barres |
| **Chord database** | `chords-db` (optional, for pre-built fingerings) | Starting chord voicing data |
| **Future notation** | `VexFlow` | Guitar tablature and standard notation staves |
| **Styling** | Tailwind CSS or CSS Modules | UI styling + print styles |
| **Print** | CSS `@media print` + `react-to-print` | Clean printable output |

### Why custom SVG components instead of using fretboard.js/vexchords directly?

Both fretboard.js and vexchords are vanilla JS libraries that manipulate the DOM directly. They work in React but don't follow React's declarative model. Building your own React SVG components means:
- Full control over layout, styling, and interaction
- Clean React state management (change a scale selection → diagram re-renders)
- Better print layout control
- No fighting between React's virtual DOM and the library's direct DOM manipulation
- You can still study their source code for the geometry/math

That said, for a **rapid prototype**, you could start with vexchords + fretboard.js and migrate to custom components later.

---

## 10. Existing Apps for Reference

These apps built with some of the libraries above can serve as inspiration:

- **[Fretty.app](https://fretty.app/)** — Fretboard diagram tool (uses tonal)
- **[StringScales](https://stringscales.com/)** — Scale visualization (uses tonal)
- **[React Guitar demo](https://react-guitar.com/)** — Interactive guitar (uses react-guitar)
- **[muted.io](https://muted.io/)** — Interactive music theory tools (uses tonal)
- **[Chromatone.center](https://chromatone.center/)** — Music theory visualization (uses tonal)
- **FretBud** (iOS) — Chord & scale explorer (uses cemolcay/MusicTheory)
