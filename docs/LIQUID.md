# Liquid material system

The same engine drives contact, selection, loading, expanding sections, travelling tab indicators, and floating-layer presence. `/playground/liquid/` provides Still, Liquid, and Extra liquid comparisons, slow motion, precise controls, a draggable panel, notifications, dialogs, and independent nested material scopes.

## Model and rendering

Each registered surface has a bounded two-dimensional height field. A press deposits a localized depression and surrounding displacement. Direction, velocity, contact position, and small seeded per-impulse variations shape the response. The solver uses bounded substeps; interrupted gestures add to current position and velocity. There is no per-frame random jitter.

Three independent damped boundary modes complement the height field. They deform the material body and optical boundary asymmetrically and settle to the original silhouette. Larger panels use a heavier response. Hit areas, text, icons, carets, and control values remain in their semantic DOM layer. Switch thumbs, slider thumbs, travelling indicators, and intentionally draggable panels retain their purposeful movement.

Supplied-scene rendering uses the height field in surface normals, shading, boundary distance, and texture displacement. General DOM surfaces use browser backdrop diffusion, a pre-baked 64-pixel low-contrast frost tile, shared environmental reflections, masked edge lighting, and bounded shell deformation. The tile avoids evaluating a procedural noise filter every frame. These paths share the same interaction state, but the CSS path approximates optical curvature and cannot refract arbitrary live DOM.

This is a perceptual material model, not a volume-fluid simulation, a physically validated flexible solid, or Apple's native renderer. Adjacent objects do not merge into a single fluid volume.

## Configuration

```tsx
<FrostProvider config={{
  liquid: true,
  liquidStrength: 1.15,
  liquidDamping: 7,
  maxDeformation: 3, // CSS pixels, additionally bounded by surface size
}}>
  <YourApplication />
</FrostProvider>
```

`frostPresets.still`, `.subtle`, and `.expressive` provide useful defaults. `motion: false` and reduced-motion preferences remove elastic recovery. `quality: 'solid'` supplies a readable opaque surface. Loading surfaces continue low-amplitude material feedback only while visible and busy; settled non-loading surfaces leave the shared scheduler.

For a custom interaction, `useFrost().excite(element, strength, x, y)` applies an impulse to an already registered surface. Contact coordinates use normalized 0–1 values; strength is bounded to −2–2. Negative values provide release-like recovery. Ordinary library components need no manual calls.

Providers share one scheduler, pointer pipeline, and WebGL context. Nested configurations override their own surfaces, including portalled popovers and menus. Closing modal stacking frames remain mounted long enough for their material recovery; layout, scroll containment, focus management, and native control values remain the primitives' responsibility.

## Frost fallback policy

Textareas and native selects have separate decorative shells because replaced native elements cannot reliably paint pseudo-elements or host decorative canvases. A missing GPU context, a failed scene image, or an unsupported optical scene keeps the CSS material visible. Browsers without backdrop-filter receive an opaque readable body rather than a bare translucent fill. Reduced-transparency and forced-color modes deliberately prioritize readable solid surfaces.

The operating system's native select menu is browser-owned and cannot be given this renderer. Use the custom Select component when a frosted floating menu is required. CSS overrides in consuming applications and unsupported browser features still require integration testing; no renderer can guarantee the same optical result in every browser.

## Verification

`tests/liquid.spec.ts` checks bounded settling, frame-rate comparisons, asymmetric deformation, stable targets, precise typing, lifecycle transitions, independent providers, portals, and native wrappers. `tests/engine-lifecycle.spec.ts` checks zero values, context loss/recovery, resource pruning, and teardown. `npm run test:production` builds and tests the actual shipped pages, including first-load CSS, overlays, notifications, mobile documentation, blocked preference storage, touch, and reduced motion. See VERIFICATION.md for measured results and remaining limitations.
