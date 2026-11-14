# Living frosted glass

## Direction

Thin manufactured glass, softly etched faces, crisp content, a neutral optical tint, and contact light that follows the interaction point. Apple Liquid Glass is a quality reference, not a claim of native renderer equivalence. The identity is monochrome, with optional color introduced through shared tokens.

## Layers

1. Material: diffusion, saturation, tint, texture, rim and internal shading. CSS backdrop-filter is a progressive enhancement; solid/high-contrast and economy modes remain usable.
2. Lighting: radial incident light, local darkening, edge reflections and a pressure depression are painted separately from content. Decorative layers never receive pointer events.
3. Interaction: a shared FrostEngine tracks input and schedules active surfaces. A bounded short-horizon predictor feeds lighting, never the semantic value of a control. A substepped spring solver recovers from presses. Only explicitly physical surfaces translate.
4. Content: native DOM and Radix primitives retain labels, text selection, focus, input timing, keyboard behavior and portal positioning.

## Runtime

One pointer pipeline, MutationObserver for portals, shared ResizeObserver and IntersectionObserver, one requestAnimationFrame scheduler that sleeps at rest. Layout reads happen before style writes. Offscreen surfaces reset and leave the active set. Reduced motion, page visibility and unmount release active work. React renders controls; frame-level updates write CSS variables directly. No WebGL context per component.

## Dependencies

Radix owns accessible interaction patterns, not optics. DayPicker owns calendar date/keyboard semantics; TanStack Table v8 owns table models; Embla owns carousel gestures; Vaul owns drawer gestures; cmdk owns command navigation; react-resizable-panels owns resizing; input-otp owns OTP input; Sonner owns toast scheduling; React Hook Form owns form state; Recharts owns charts. Source dependencies are resolved transitively by the local copy tool and registry builder.

## Interaction families

Ordinary controls remain spatially stationary on hover. Their contact light and pressure shade respond locally. Input text, caret and selection never warp. Floating overlays have stronger diffusion and contact shadows; placement transforms belong to Radix. Slider values come only from real input. Draggable lab objects demonstrate bounded motion separately from form controls. Touch/pen presses create contact lighting without hover requirements. Keyboard focus has a persistent, sharp outline.

## Scope and limits

The material is a browser DOM/CSS optical approximation. It does not trace or reconstruct arbitrary page pixels like a native compositor. Backdrop blur and local shading are real; suggested refraction comes from edge/specular shading. Component equivalence describes a working alternative, not identical shadcn API/variant parity. The coverage checklist and verification report record actual checks and limitations.
