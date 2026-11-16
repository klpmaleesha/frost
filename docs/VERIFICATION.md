# Verification / Frost 0.2

Local project, Windows, 2026-11-16. Preview: http://127.0.0.1:5174/. Public documentation: https://frost.avyntora.com/. The library has not been published to npm.

## Completed checks

- The 34-check browser inventory was exercised in Chrome 157. A broad run passed 32 checks; a context-loss test fixture incorrectly re-requested its extension after loss, and a large development-only gallery needed an explicit readiness wait. After correcting those test conditions, all 12 targeted engine, liquid, overlay, chart, containment, and shape checks passed. The other 22 checks had passed in the broad run.
- Three separate production-build checks passed: first-load frost CSS, the liquid scene and overlays, native controls, mobile guide navigation, reduced motion, touch, and blocked preference storage. Final checks also assert one WebGL context with nested providers and saved material settings after reload.
- All 68 component families have source and live examples. Desktop/mobile rendering and source examples are exercised, with visible content containment at 320 and 768 pixels. Intentional internal scrolling is respected.
- Dialogs, drawers, and sheets: full frame containment, close-button access, hit testing above backdrops, and horizontal overflow at widths 320, 390, 768, and 1440.
- Precise slider keyboard values; editable notes; keyboard menu selection; nested popovers; dialog validation, completion, and dismissal; interrupted switches, dragging, release/cancellation, and keyboard movement.
- Reflection transfer in both directions between parent and child surfaces. Checks read computed light values, including inheritance, and assert that inactive controls remain at zero.
- Home, handbook, installation, component details, and application examples at phone and desktop widths. Dark theme persistence and theme-aware home preview, selected surfaces, documentation book, and code panels.
- Automated WCAG A/AA checks on representative light/dark pages and the laboratory dialog. Emulated touch, reduced motion, and solid-surface task completion.
- Optical scenes: white, black, grid, photography, and tint. Pure white/black scene pixels are 255/0. Shader normal diagnostics and actual uniform values are inspected. High-contrast pattern and moving/scrolling DOM scenes are available in the permanent stress lab.
- Standalone library and website builds, TypeScript declarations, 68 copied examples, and a fresh transitive source installation in a separate consumer fixture.
- Production output has 99 physical page paths with metadata, a sitemap, separate component pages, 16 handbook guides, and focused playgrounds. Advanced demonstrations load in separate chunks.

## Measured performance

Chrome 157 on this Windows desktop, local server. Fifty pointer traversals with 65 surfaces / 12 enhanced surfaces: 175 intervals, median 16.7ms, p95 16.8ms, no observed tasks over 50ms. Scheduler returns to idle. See performance.json.

The isolated 1440 × 1000 shape task performs 12 expansions/collapses with 90ms interruptions. After background texture caching, height-field buffer reuse, and removing redundant geometry reads: 399 intervals, median 16.7ms, p95 18.2ms, one reported 50ms long task, and zero background texture uploads. See shape-performance.json. Earlier concurrent measurements were worse; the isolated result does not guarantee smoothness during other intensive workloads or on other hardware.

## Hosted and floating-frame follow-up

The public Vercel build was verified by matching its asset URL to the local production output. A Chrome check of the hosted liquid playground confirmed a WebGL button, a CSS-frost dialog with 24px diffusion and its baked texture, working notifications, and no runtime errors. A subsequent visual inspection found the floating frame clipping its own ambient shadow. The shell now permits optical paint outside its bounds while the inner scroll body remains contained. Three additional overlay checks passed, including frame containment at 320/390/768/1440, all component content at 320/768, and explicit shadow/scroll separation.

## Liquid and fallback verification

Presses deform the body and rim asymmetrically, while the button bounding box stays fixed and input editing stays precise. Field tests compare 30/60/120Hz, check bounds and finite state, and require complete settling. Dialog entry/exit, nested popovers, form validation, notifications, loading state, and tabs work in the liquid playground. Nested provider and portal settings stay independent. Simulated context loss activates CSS frost; restoration recovers the optical renderer. Removed scenes release resources and engine teardown restores prior material properties. Textareas and native selects use separate decorative shells; the default chart tooltip now uses the same material rather than an inline translucent fill.

The computer was suspended during one earlier run; its timeouts and timings are excluded. Final visual review included normal-size Chrome screenshots of contact, native controls, overlays, chart layouts, white/black scenes, and production home. In-app browser automation became unavailable during the final pass, so the final screenshots came from the browser test runner.

## Material and usability repairs

Charts retain their explicit measured width inside Recharts' zero-width measurement wrapper. Status badges no longer stretch. Modal paint frames are separate from scroll bodies. Parent/child contact lighting has exclusive pointer ownership and independent reset values. Shell resizing no longer rebuilds unchanged background textures. Diagnostic refreshes no longer rerender the whole interactive lab. Fonts are bundled locally, removing remote font-load stalls. Contact reflection is broader and lower in intensity in both the CSS material and shader.

## Limits

The shader refracts supplied scenes, not arbitrary live DOM or another glass shell's framebuffer. General DOM and portal overlaps use CSS diffusion with controlled opacity. Size, thickness, elevation, pressure, and elastic responses are perceptual approximations, not physically validated simulation or native Apple rendering.

Coverage does not promise every upstream shadcn variant or identical APIs. Example applications use local state; no persistence, authentication, or email service is connected. An actual shadcn CLI install of Button, Input, Dialog, Textarea, and NativeSelect into a separate consumer succeeded, and its TypeScript and Vite builds passed. The local source installer and all 68 copied examples also type-check. Real mobile hardware, screen readers, and wider browser coverage remain release work.
