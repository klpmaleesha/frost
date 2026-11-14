# Verification / Frost 0.2

Local project, Windows, 2026-11-14. Preview: http://127.0.0.1:5174/. Publishing is on hold at the user's request. No production deployment or npm publication has occurred.

## Completed checks

- All 28 browser checks passed together in installed Chrome 157. A subsequent focused run of 7 site and shape checks passed after isolating diagnostics and aligning the shared lighting angle.
- All 68 component families have source and live examples. Desktop/mobile rendering and source examples are exercised, with visible content containment at 320 and 768 pixels. Intentional internal scrolling is respected.
- Dialogs, drawers, and sheets: full frame containment, close-button access, hit testing above backdrops, and horizontal overflow at widths 320, 390, 768, and 1440.
- Precise slider keyboard values; editable notes; keyboard menu selection; nested popovers; dialog validation, completion, and dismissal; interrupted switches, dragging, release/cancellation, and keyboard movement.
- Reflection transfer in both directions between parent and child surfaces. Checks read computed light values, including inheritance, and assert that inactive controls remain at zero.
- Home, handbook, installation, component details, and application examples at phone and desktop widths. Dark theme persistence and theme-aware home preview, selected surfaces, documentation book, and code panels.
- Automated WCAG A/AA checks on representative light/dark pages and the laboratory dialog. Emulated touch, reduced motion, and solid-surface task completion.
- Optical scenes: white, black, grid, photography, and tint. Pure white/black scene pixels are 255/0. Shader normal diagnostics and actual uniform values are inspected. High-contrast pattern and moving/scrolling DOM scenes are available in the permanent stress lab.
- Standalone library and website builds, TypeScript declarations, 68 copied examples, and a fresh transitive source installation in a separate consumer fixture.
- Production output has 98 physical page paths with metadata, a sitemap, separate component pages, 16 handbook guides, and focused playgrounds. Advanced demonstrations load in separate chunks.

## Measured performance

Chrome 157 on this Windows desktop, local server. Fifty pointer traversals with 62 surfaces / 12 enhanced surfaces: 174 intervals, median 16.7ms, p95 16.9ms, no observed tasks over 50ms. Scheduler returns to idle. See performance.json.

The isolated 1440 × 1000 shape task performs 12 expansions/collapses with 90ms interruptions. After background texture caching and diagnostic isolation: 392 intervals, median 16.7ms, p95 16.9ms, no long tasks, and zero background texture uploads. See shape-performance.json. Earlier concurrent measurements were worse; the isolated result does not guarantee smoothness during other intensive workloads or on other hardware.

## Material and usability repairs

Charts retain their explicit measured width inside Recharts' zero-width measurement wrapper. Status badges no longer stretch. Modal paint frames are separate from scroll bodies. Parent/child contact lighting has exclusive pointer ownership and independent reset values. Shell resizing no longer rebuilds unchanged background textures. Diagnostic refreshes no longer rerender the whole interactive lab. Fonts are bundled locally, removing remote font-load stalls. Contact reflection is broader and lower in intensity in both the CSS material and shader.

## Limits

The shader refracts supplied scenes, not arbitrary live DOM or another glass shell's framebuffer. General DOM and portal overlaps use CSS diffusion with controlled opacity. Size, thickness, elevation, pressure, and elastic responses are perceptual approximations, not physically validated simulation or native Apple rendering.

Coverage does not promise every upstream shadcn variant or identical APIs. Example applications use local state; no persistence, authentication, or email service is connected. A separate shadcn CLI consumer install has not been exercised; the local source installer, registry transitive closure, and copied examples have been checked. Real mobile hardware, screen readers, and wider browser coverage remain release work.
