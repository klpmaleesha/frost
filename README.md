# Avyntora UI / Frost 0.2

A React + TypeScript component library with a shared frosted-glass material, local contact lighting, spring state transitions, and a progressive curved-surface renderer. Black, white and neutral defaults; arbitrary accents and glass tint.

## Run the interactive library

```sh
npm install
npm run dev -- --port 5174
```

The live explorer includes 68 families: equivalents for the 66 entries in the official shadcn/ui main catalog audited on 2026-11-14, plus Form and Frost. Each has a live example, typed source, copyable usage and installation information. Equivalence does not mean identical upstream APIs or every upstream variant. AI Elements is a separate upstream collection and is outside this inventory.

The dedicated /playground/liquid/ page demonstrates full-shell pressure, boundary recovery, popup entry/exit, notifications, loading, and nested material scopes. Material demonstrations also include pure white/black, an optical before/after, supplied-photo/grid refraction, five representative controls, edge inspection, physics presets, slow-motion inspection and a draggable panel. Settings, dashboard, and project form examples demonstrate denser interfaces. These examples use local state, not a backend.

## Website pages

The local home page is http://127.0.0.1:5174/. Documentation has a separate cover at /docs/, 16 focused guides, and individual routes for all 68 component families. Examples and material studies are separate pages. /playground/stress/ contains the permanent optical and usability lab, renderer diagnostics, and shape-transition tests. Production builds write 99 addressable HTML pages with metadata and a sitemap. Documentation is hosted at https://frost.avyntora.com/.

The engine now has shared lighting, thickness-driven optical metrics, Frost/Clear/Dense material presets, size-aware detail, overlapping-surface policy, and continuous DOM shell transitions. See docs/ENGINEERING.md for the implemented effects and limits.

## Source installation

From this repository:

```sh
node scripts/add.mjs button input switch --cwd ../my-react-app
# Or: node scripts/add.mjs --all --cwd ../my-react-app
```

The tool resolves source dependencies and includes the shared engine and styles. It prints the exact runtime dependencies to install. `--dir` selects a directory within your project. Existing source and styles are preserved, and an existing barrel is left alone; add exports for newly copied components as needed.

```tsx
import { FrostProvider } from './components/avyntora/frost';
import { Button } from './components/avyntora/button';
import './components/avyntora/styles.css';

export default function App() {
  return <FrostProvider><Button>Feel the difference</Button></FrostProvider>;
}
```

## shadcn registry

```sh
npm run registry
# In an existing shadcn-configured React project, while this server runs:
npx shadcn@latest add http://127.0.0.1:5174/r/button.json
```

Each registry item includes its source closure, Frost, CSS and declared runtime dependencies, under your configured UI alias in an `avyntora` subfolder. Deploy the `dist` directory for a public registry; the explorer generates commands from its current origin. No npm package or public site has been published.

## Build a local package

```sh
npm run build:lib
npm pack
# In another project:
npm install /path/to/avyntora-ui-0.2.0.tgz
```

```tsx
import { Button, FrostProvider, FrostScene } from 'avyntora-ui';
import 'avyntora-ui/styles.css';

<FrostProvider>
  <FrostScene kind="photo" image="/your-scene.jpg">
    <Button>Local contact light</Button>
  </FrostScene>
</FrostProvider>
```

React and React DOM are peers. Interactive primitives use Radix. Advanced families use established libraries: DayPicker, TanStack Table v8, Recharts, Embla, cmdk, Vaul, Sonner, input-otp, react-resizable-panels and React Hook Form. Source installation only asks for dependencies actually used by the selected source closure.

## Material and motion

The CSS path diffuses arbitrary underlying page content. The optional WebGL path uses a rounded distance profile, derived normals, frosted scene sampling and local pressure to render explicitly supplied scenes. **It cannot refract arbitrary live DOM.** It does not reproduce Apple’s native renderer. The curved rim is frosted, rather than a clear strip around the face.

Use `frostPresets.still`, `.subtle` or `.expressive`; Subtle is the default. Reduced motion removes elastic decoration. `quality: 'solid'` removes transparency, and `'economy'` reduces rendering cost. A single scheduler updates active visible surfaces and sleeps when settled. Prediction drives light, never semantic values.

See [liquid motion and fallback behavior](docs/LIQUID.md), [material and tokens](docs/MATERIAL.md), [architecture](docs/ARCHITECTURE.md), [coverage](docs/COVERAGE.md), and [verification](docs/VERIFICATION.md). Modal layout and stacking are intentionally separated from optical paint in the final `layout.css` layer.

## Checks

```sh
npm run build
npm run build:lib
npm run check:distribution
npx playwright install chromium
npm test
npm run test:production
```

The browser tests cover all live examples, narrow layouts, chart paint resources, fully contained dialogs/drawers/sheets above their backdrops, keyboard behavior, nested popovers, touch, reduced motion, pointer reversals, switch alignment, dragging/cancellation, solid fallback and automated WCAG checks. `CHROMIUM_PATH` can select an installed browser. Distribution checking type-checks all copied examples and exercises the transitive local source installer.

Use the included verification report for actual results and limitations. Cross-browser, assistive-technology and production integration review remain necessary.

MIT licensed. Reference imagery under `docs` is retained only for internal comparison and is not an Avyntora asset.
