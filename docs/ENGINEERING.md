# Frost material engineering / 0.2

The renderer combines established signed-distance geometry, finite-difference normals, a restrained Fresnel reflection approximation, rough texture transmission, and a custom shared interaction scheduler. This is application rendering engineering, not a claimed scientific invention or a physically accurate flexible-glass simulation.

## What changed

- One normalized light direction, reflection color, intensity, and ambient term feed the supplied-scene shader. The CSS fallback derives its reflection position, angle, and highlight color from that same environment.
- `materialMetrics` bounds thickness and smoothly adapts rim extent, refraction distance, absorption, internal shading, frost detail, and shadow separation to element dimensions.
- Roughness stays separate from thickness. Frost, Clear, and Dense coordinate transmission and body opacity without changing the light or interaction model.
- Portal layers retain semantic DOM focus and scrolling. Their body tone is more opaque. Nested CSS controls reduce diffusion instead of compounding the full blur at every level.
- Contact light has one pointer owner. Local reset values prevent inheritance from an active ancestor. On transfer, the previous reflection clears immediately; pressure can finish its own recovery.
- Shape changes update a real DOM shell's width, height, and corner radius using the shared frame-independent spring solver. Text is never scaled. Reduced motion jumps directly to destination geometry.

## Backgrounds and overlap

The WebGL renderer reads explicitly supplied generated scenes or a supplied image. It cannot sample arbitrary live DOM. Each enhanced shell samples that scene's base textures. It does not capture another shell's refracted output. Children of enhanced shells use CSS material rather than nested optical canvases. Portal overlays use browser backdrop compositing and more opaque material. This supports readable, correctly stacked overlaps; it is not multi-layer ray tracing. Dynamic DOM behind a CSS surface can be diffused by browser backdrop-filter, but is not refracted by the shader.

## Diagnostics

`/playground/stress/` contains real tasks plus pure white/black, grid, high contrast, photography, moving DOM, baseline comparison, slow motion, solid/economy modes, and actual renderer inspection. Normals show the finite-difference normal used by the lighting calculation. Curvature displays the rim-profile weight (not mathematical principal curvature). Thickness displays the local profile scaled by the thickness setting (not a physical depth measurement). Lighting shows environmental reflection/specular contributions. Pointer shows the actual localized contact contributions. The data panel reports the dimensions and values last used for rendering; an off-screen, not-yet-painted probe reports null optics.

## Remaining limits

The CSS fallback approximates a curved optical edge with masked illumination and shading. Only the supplied-scene mode actually displaces a texture. Elevation is a perceptual hierarchy of shadows and separation; it is not a 3D scene. Shell pressure, elastic motion, and prediction are bounded artistic responses. Independent material resources and geometry are shared, but copying GPU output to visible canvases still has CPU/compositing overhead. Large overlapping blur regions need evaluation on target hardware. The photograph cannot be used if its cross-origin policy prevents texture loading; the DOM material remains available.
