# Frost material and motion

Frost has two rendering paths. The DOM/CSS path diffuses arbitrary content using backdrop-filter, a grain layer, local contact lighting, and a continuously masked directional rim. It does not geometrically refract live DOM. The progressive WebGL path computes a rounded-rectangle signed distance, a smoothly curved height profile, height-derived normals, a restrained grazing reflection, and refracted coordinates into an explicitly supplied scene. A separate prefiltered texture keeps the curved rim frosted too. Text, carets, icons, hit targets and focus outlines are not rendered into or distorted by the shader.

Use `FrostProvider` once. Its single scheduler updates active, visible surfaces, preserves spring velocity across interruptions, and sleeps at rest. Use `FrostScene kind="photo" image="/your-image.jpg"` for actual scene refraction; generated `grid`, `light`, `dark`, and `tint` scenes are also available. The shader cannot sample arbitrary live page content. Images must be same-origin or permit CORS. Without WebGL, the CSS material remains usable. Solid and economy modes hide the optical enhancement.

## Configuration

`defaultFrostConfig` is the Subtle preset. `frostPresets.still`, `.subtle`, and `.expressive` can be passed to the provider. `stiffness`, `damping`, `mass`, `settling`, `deformation`, `maxDeformation`, and `timeScale` tune motion. `blur`, `opacity`, `saturation`, `roughness`, `tint`, `thickness`, `edge`, `edgeDiffusion`, `innerShade`, `lightAngle`, `glow`, and `shadow` tune optics. `quality` selects `full`, `economy`, or `solid`. Ordinary hover never translates controls; explicit drag surfaces use pointer capture and bounded motion.

The pointer predictor is bounded and resets on reversals. Prediction affects decorative light only, never slider values, text selection, or hit testing. Touch creates contact feedback without a hover cursor. Pen pressure scales the contact impression. Keyboard-triggered state changes use the same state solver. Reduced motion removes decorative travel and deformation; semantic changes remain immediate.

## Tokens

Neutral surfaces: `--av-bg`, `--av-surface`, `--av-subtle`, `--av-text`, `--av-muted`, `--av-border`. Accent: `--av-accent`, `--av-on-accent`, `--av-accent-soft`, `--av-ring`. Shape: `--av-radius`. Glass: `--frost-tint`, `--frost-opacity`, `--frost-blur`, `--frost-saturation`, `--frost-thickness`, `--frost-edge`, `--frost-edge-diffusion`, `--frost-inner-shade`, `--frost-glow`, `--frost-shadow`, `--frost-elevation`. Do not set on-accent text without checking contrast. The gallery chooses black or white text using relative luminance.

## Reference analysis

Apple’s published Liquid Glass close-up and WWDC presentation show lensing, continuously changing shape reflections and scene adaptation. The previous implementation painted a ring over a blurred face; it did not bend the background. The prototype now derives reflections and sample displacement from one surface profile. This is an idealized browser approximation, not Apple’s native compositor or a physically validated optical simulation. It does not yet provide Apple’s environment-aware adaptation, arbitrary live-layer refraction, or fluid merging between adjacent objects.

References: [Apple’s official design announcement](https://www.apple.com/newsroom/2025/06/apple-introduces-a-delightful-and-elegant-new-software-design/), [Meet Liquid Glass](https://developer.apple.com/videos/play/wwdc2025/219/). The reference images in this docs folder are for internal comparison and are not library assets.
