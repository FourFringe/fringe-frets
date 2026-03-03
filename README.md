# Fringe Frets

A fretboard visualization app for stringed instruments. Renders interactive
fretboard diagrams, scale maps, and chord voicings as SVG line drawings that
look great on screen and in print.

## Purpose

Fringe Frets helps musicians:

- **Visualize scales** on a fretboard — see which notes belong to any scale,
  across all strings and frets.
- **Explore chord voicings** — understand how chords are built and where they
  sit on the neck.
- **Print clean diagrams** — every diagram renders as SVG, so it prints at any
  size without losing quality.
- **Switch instruments** — guitar, mandolin, ukulele, violin, and cello are
  supported with correct tuning and fret counts.

The app runs entirely in the browser with no backend. User preferences
(instrument, tuning, last-used scale) persist in `localStorage`.

## Tech Stack

| Layer              | Library                                      |
| ------------------ | -------------------------------------------- |
| UI framework       | React 19                                     |
| Language           | TypeScript (strict mode)                     |
| Build tool         | Vite 7                                       |
| Component library  | Mantine 8 (dark theme default)               |
| Routing            | React Router 7                               |
| Music theory       | tonal 6                                      |
| Diagrams           | Custom SVG components (React)                |
| Unit tests         | Vitest + React Testing Library               |
| E2E tests          | Playwright (Chromium)                        |
| Linting            | ESLint 9 (flat config) + eslint-config-prettier |
| Formatting         | Prettier (single quotes, trailing commas, 100-char width) |
| Package manager    | Yarn 1.x                                     |
| Node version       | 22 LTS (managed via asdf `.tool-versions`)   |
| Deployment target  | Static site (S3 + CloudFront, GitHub Actions) |

## Project Structure

```
src/
├── main.tsx                    # Entry point; MantineProvider + theme
├── App.tsx                     # BrowserRouter, route definitions
├── theme.ts                    # Mantine theme overrides
├── index.css                   # Minimal global resets + print styles
│
├── models/                     # Pure TypeScript types and constants
│   ├── instrument.ts           #   Instrument type + catalog (guitar, mandolin, …)
│   ├── music.ts                #   FretPosition, ScaleSelection, ChordSelection, note names
│   └── settings.ts             #   UserSettings type + defaults
│
├── services/                   # Stateless business logic (no React imports)
│   ├── fretboard.ts            #   Note math, fretboard grid builder, pitch-class filter
│   ├── scales.ts               #   Scale lookup / categorization via tonal
│   ├── chords.ts               #   Chord lookup / categorization via tonal
│   └── storage.ts              #   localStorage read/write for settings
│
├── hooks/                      # React hooks that combine services + state
│   ├── useSettings.ts          #   Settings state + localStorage sync
│   ├── useInstrument.ts        #   Resolve Instrument from settings ID
│   └── useScale.ts             #   Compute scale notes + highlighted fret positions
│
├── components/                 # Reusable UI components
│   └── layout/
│       ├── AppShell.tsx        #   Sidebar nav + instrument selector + <Outlet>
│       └── AppShell.module.css
│
└── pages/                      # Route-level page components
    ├── Home/
    ├── ScaleExplorer/
    ├── ChordBuilder/
    └── TabViewer/

tests/
├── setup.ts                    # Vitest setup (jest-dom matchers)
├── unit/                       # Unit tests for services and hooks
└── e2e/                        # Playwright browser tests (future)
```

### Layer rules

| Layer        | May import from            | Must NOT import from |
| ------------ | -------------------------- | -------------------- |
| `models/`    | nothing (pure types)       | anything with side effects |
| `services/`  | `models/`, `tonal`         | React, DOM, hooks    |
| `hooks/`     | `models/`, `services/`, React | components, pages |
| `components/`| `models/`, `hooks/`, React, Mantine | pages       |
| `pages/`     | everything above           | other pages          |

## Key Concepts

### Instrument model

Each instrument is defined by its string count, default tuning (as note + octave
strings like `E2`), and fret count. Tuning can be overridden per-user in
settings. The `INSTRUMENTS` catalog lives in `models/instrument.ts`.

### Fretboard mapping

`services/fretboard.ts` uses MIDI-number arithmetic (via tonal's `Note` module)
to compute the note at every `(string, fret)` position. `buildFretboard()`
returns a 2D array of `FretPosition` objects. `filterByPitchClasses()` narrows
that grid to just the positions matching a given set of pitch classes (e.g. the
notes of a scale or chord).

### SVG rendering

All diagrams — fretboard grids, scale overlays, chord voicing dots — are
rendered as React SVG components. No external rendering library is used; we own
the markup so it stays lightweight, printable, and fully styleable.

### Persistence

User settings are stored in `localStorage` under the key
`fringe-frets-settings`. The `useSettings` hook loads on mount and writes on
every change. There is no server, no auth, no database.

## Development

```bash
yarn install          # install dependencies
yarn dev              # start Vite dev server (http://localhost:5173)
yarn test             # run unit tests once
yarn test:watch       # run unit tests in watch mode
yarn test:coverage    # run unit tests with coverage report
yarn test:e2e         # run Playwright E2E tests
yarn lint             # check ESLint rules
yarn lint:fix         # auto-fix ESLint issues
yarn format           # format all files with Prettier
yarn format:check     # check formatting without writing
yarn typecheck        # run TypeScript compiler in check-only mode
yarn validate         # typecheck + lint + format:check + test (CI gate)
yarn build            # production build (typecheck then Vite build)
```

## Conventions

### Code style

- **Prettier** handles all formatting. No manual style debates. Run
  `yarn format` and move on.
- **Single quotes**, **trailing commas**, **semicolons**, **2-space indent**,
  **100-char line width** (see `.prettierrc`).
- **Named exports** over default exports (except `App.tsx` for Vite convention).
- Prefix unused parameters with `_` (enforced by ESLint).

### TypeScript

- Strict mode is on. No `any` unless absolutely necessary and documented.
- Use `interface` for object shapes, `type` for unions / intersections.
- Models are plain types — no classes, no decorators.

### Testing

- **TDD-informed**: write or update tests alongside implementation, not after.
  A service function should have a corresponding test file from the start.
- **Unit tests** live in `tests/unit/` and cover services, hooks, and pure
  components. Use Vitest + React Testing Library + jsdom.
- **E2E tests** live in `tests/e2e/` and cover page-level user flows. Use
  Playwright against the running dev server.
- Aim for test names that read as behavior: *"returns the open string note at
  fret 0"*, not *"test getNoteAtFret"*.

### Components

- Presentational components receive data via props; page components wire hooks
  to presentational components.
- CSS Modules for component-specific styles. Mantine components for standard
  UI controls (selects, buttons, cards).
- SVG components accept dimension and data props, compute layout internally,
  and return `<svg>` elements — no `useEffect`, no DOM measurement.

### Git

- Small, focused commits. Each commit should leave the app in a working state.
- Commit message format: imperative mood, e.g. *"Add fretboard SVG component"*.

## Deployment

The app is a static SPA. The production build (`yarn build`) produces a `dist/`
folder that can be served from any static host, pointed at with:

- **AWS S3 + CloudFront** with a GitHub Actions workflow for CI/CD.
- `index.html` as the fallback for client-side routing.
- No environment variables or runtime config required.
