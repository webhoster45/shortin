---
name: Shortin Precision System
colors:
  surface: '#faf8ff'
  surface-dim: '#d2d9f4'
  surface-bright: '#faf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f3ff'
  surface-container: '#eaedff'
  surface-container-high: '#e2e7ff'
  surface-container-highest: '#dae2fd'
  on-surface: '#131b2e'
  on-surface-variant: '#464554'
  inverse-surface: '#283044'
  inverse-on-surface: '#eef0ff'
  outline: '#767586'
  outline-variant: '#c7c4d7'
  surface-tint: '#494bd6'
  primary: '#4648d4'
  on-primary: '#ffffff'
  primary-container: '#6063ee'
  on-primary-container: '#fffbff'
  inverse-primary: '#c0c1ff'
  secondary: '#6b38d4'
  on-secondary: '#ffffff'
  secondary-container: '#8455ef'
  on-secondary-container: '#fffbff'
  tertiary: '#006577'
  on-tertiary: '#ffffff'
  tertiary-container: '#008096'
  on-tertiary-container: '#f9fdff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e1e0ff'
  primary-fixed-dim: '#c0c1ff'
  on-primary-fixed: '#07006c'
  on-primary-fixed-variant: '#2f2ebe'
  secondary-fixed: '#e9ddff'
  secondary-fixed-dim: '#d0bcff'
  on-secondary-fixed: '#23005c'
  on-secondary-fixed-variant: '#5516be'
  tertiary-fixed: '#acedff'
  tertiary-fixed-dim: '#4cd7f6'
  on-tertiary-fixed: '#001f26'
  on-tertiary-fixed-variant: '#004e5c'
  background: '#faf8ff'
  on-background: '#131b2e'
  surface-variant: '#dae2fd'
typography:
  display:
    fontFamily: Inter
    fontSize: 3.5rem
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.035em
  headline-lg:
    fontFamily: Inter
    fontSize: 2.25rem
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: -0.025em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 1.75rem
    fontWeight: '600'
    lineHeight: '1.25'
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 1.5rem
    fontWeight: '600'
    lineHeight: '1.3'
    letterSpacing: -0.02em
  headline-sm:
    fontFamily: Inter
    fontSize: 1.125rem
    fontWeight: '600'
    lineHeight: '1.4'
    letterSpacing: -0.015em
  body-lg:
    fontFamily: Inter
    fontSize: 1rem
    fontWeight: '400'
    lineHeight: '1.5'
    letterSpacing: -0.011em
  body-md:
    fontFamily: Inter
    fontSize: 0.875rem
    fontWeight: '400'
    lineHeight: '1.5'
    letterSpacing: -0.006em
  body-sm:
    fontFamily: Inter
    fontSize: 0.75rem
    fontWeight: '400'
    lineHeight: '1.45'
    letterSpacing: 0em
  label-lg:
    fontFamily: Inter
    fontSize: 0.875rem
    fontWeight: '500'
    lineHeight: '1'
    letterSpacing: -0.005em
  label-md:
    fontFamily: Inter
    fontSize: 0.75rem
    fontWeight: '500'
    lineHeight: '1'
    letterSpacing: 0.01em
  label-caps:
    fontFamily: Inter
    fontSize: 0.6875rem
    fontWeight: '600'
    lineHeight: '1'
    letterSpacing: 0.06em
  code:
    fontFamily: JetBrains Mono
    fontSize: 0.8125rem
    fontWeight: '500'
    lineHeight: '1.4'
    letterSpacing: -0.01em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-mobile: 1rem
  margin: 2rem
  margin-mobile: 1rem
  space-2xs: 0.125rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.75rem
  space-lg: 1.25rem
  space-xl: 2rem
  space-2xl: 3rem
---

## Brand & Style

The design system embodies the razor-sharp execution of Linear, the tactile fluidity of Raycast, and the pristine architectural restraint of Vercel. Engineered for creators, modern growth teams, and power consumers, it elevates link management from an invisible utility into a focused, premium workspace. 

The aesthetic is grounded in absolute visual clarity, structured utility, and subtle kinetic delight. It pairs a pristine, near-paper background with fine translucent glass overlays, micro-textured borders, and precise electric indigo-to-violet energetic accents. The emotional impression is fast, surgical, trustworthy, and effortlessly polished.

## Colors

The color palette centers around an electric spectrum grounded against balanced, luminous neutrals.

- **Primary (`#6366f1` - Indigo 500) & Secondary (`#8b5cf6` - Violet 500):** Applied as active key states, gradient edge highlights, progress tracks, and high-impact actions. Linear gradients moving at 135 degrees from `#6366f1` to `#8b5cf6` denote primary execution states, active link analytics, and branded callouts.
- **Tertiary (`#06b6d4` - Cyan 500):** Reserved for real-time telemetry, live click pings, webhook statuses, and sub-millisecond route verifications.
- **Neutrals (Slate spectrum):** Grounded in `#0f172a` (Slate 900) for high-contrast primary typography and icons, transitioning through `#475569` (Slate 600) for secondary details, down to crisp borders (`rgba(15, 23, 42, 0.08)`) and high-luminance canvas backdrops (`#ffffff` canvas, `#f8fafc` offset container tint).

```
Gradient Signature: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)
Border Subtlety: rgba(15, 23, 42, 0.08) in light mode; rgba(255, 255, 255, 0.1) in dark containers
```

## Typography

Typography relies entirely on **Inter** for clean readability, tight numerical alignment, and systematic tracking across sizes, paired with **JetBrains Mono** strictly for short links, UTM query tokens, API paths, and hash keys.

- Negative tracking (`-0.035em` to `-0.015em`) is enforced across display and heading levels to reproduce the tight, engineered finish found in Vercel and Raycast interfaces.
- `label-caps` is utilized exclusively for metadata groupings, keyboard shortcut descriptors, table headers, and analytics axes.
- Numerical readouts in charts and click counters always enable tabular numbers (`font-feature-settings: "tnum" 1`).

## Layout & Spacing

The layout is built on a 12-column responsive fluid grid with maximum container widths capped at `1280px` for desktop consoles and `768px` for focused creation views (e.g., Quick Shorten modal/command bar).

- **Mobile (&lt;640px):** 4-column layout, `margin-mobile: 1rem`, `gutter-mobile: 1rem`. Bottom sheets replace standard dropdown menus; action triggers lock to sticky bottom bars.
- **Tablet (640px - 1024px):** 8-column layout, `margin: 1.5rem`, `gutter: 1.25rem`. Two-pane view for links and quick previews.
- **Desktop (&gt;1024px):** 12-column layout, `margin: 2rem`, `gutter: 1.5rem`. Split workflow featuring list view (5 cols) and deep analytics detail view (7 cols).

Internal spacing strictly adheres to 4px/8px rhythm multipliers to maintain dense, utility-driven vertical balance.

## Elevation & Depth

Visual hierarchy uses frosted glassmorphism layered over structured surfaces, avoiding muddy or opaque shadows.

- **Level 0 (Base Canvas):** Pristine `#ffffff` or faintly tinted `#f8fafc`. No shadow.
- **Level 1 (Cards, Link Rows):** `#ffffff` with a fine hairline border (`1px solid rgba(15, 23, 42, 0.07)`) and an ambient drop shadow: `0 1px 3px rgba(15, 23, 42, 0.03), 0 1px 2px rgba(15, 23, 42, 0.02)`.
- **Level 2 (Glass Overlays & Popovers):** Translucent backdrop filter (`background: rgba(255, 255, 255, 0.82); backdrop-filter: blur(12px) saturate(180%); -webkit-backdrop-filter: blur(12px)`), bound by `1px solid rgba(255, 255, 255, 0.4)` on top and `1px solid rgba(15, 23, 42, 0.06)` along sides/bottom. Shadow: `0 10px 25px -5px rgba(15, 23, 42, 0.05), 0 8px 10px -6px rgba(15, 23, 42, 0.03)`.
- **Level 3 (Command Menu & Modals):** Raycast-style spotlight containers. Glass surface (`rgba(255, 255, 255, 0.94); backdrop-filter: blur(20px)`), perimeter glow: `0 0 0 1px rgba(99, 102, 241, 0.15)`, cast shadow: `0 25px 50px -12px rgba(15, 23, 42, 0.12)`.

## Shapes

The design system utilizes rounded structural corners, standardizing on modern `rounded-2xl` (`1rem` / `16px`) for primary cards, containers, and elevated modules, contrasted with compact radii for inner primitives.

- **Full Containers, Cards & Modals:** `1rem` (`16px`, equivalent to `rounded-2xl`).
- **Form Controls, Buttons & Inputs:** `0.625rem` (`10px`) for balanced tactile hit states.
- **Status Pills, Chips, Badges & Avatars:** Fully circular pill curvature (`9999px`).
- **Shortcut & Key Tags:** `0.375rem` (`6px`).

## Components

### Buttons
- **Primary:** Gradient fill (`linear-gradient(135deg, #6366f1, #8b5cf6)`), solid white text, subtle inner top shadow (`inset 0 1px 0 rgba(255, 255, 255, 0.25)`), `border-radius: 10px`. Transitions with `scale(0.98)` on click.
- **Secondary / Ghost:** `#ffffff` surface, `1px solid rgba(15, 23, 42, 0.08)`, `#0f172a` text. Hover brings surface to `#f8fafc` and border to `rgba(99, 102, 241, 0.2)`.
- **Icon / Action:** `32x32px` square with `8px` radius. Neutral slate icon tinting to indigo on hover.

### Status Pills & Friendly Badges
- **Status Pills:** Fully rounded (`9999px`), `h-6`, horizontal padding `0.625rem`. Subtle semi-transparent backgrounds with a breathing status dot:
  - *Active / Healthy:* Background `rgba(16, 185, 129, 0.1)`, text `#059669`, pulse dot `#10b981`.
  - *Redirecting / Temp:* Background `rgba(99, 102, 241, 0.1)`, text `#4f46e5`, solid dot `#6366f1`.
  - *Expired / Paused:* Background `rgba(100, 116, 139, 0.1)`, text `#475569`, solid dot `#94a3b8`.
- **Feature Badges:** Gradient border accent, subtle background shimmer, paired with friendly typography (`label-caps`).

### Input Fields & URL Shorten Bar
- **Quick Shorten Command Bar:** Hero input component with large glass treatment (`h-14`), outer boundary glow on focus (`0 0 0 3px rgba(99, 102, 241, 0.15)`), inset button at trailing end, and a mono-styled prefix (`short.in/`).
- **Standard Inputs:** `h-10`, `border-radius: 10px`, background `#ffffff`, `border: 1px solid rgba(15, 23, 42, 0.1)`. Focus instantly swaps border to `#6366f1` with zero lag.

### Cards & Link List Items
- **Link Card:** Level 1 elevation, `rounded-2xl`, responsive padding (`space-lg`). Incorporates a quick-copy button, hover-reveal QR popover trigger, live click counter metric, and target destination preview with automatic favicon extraction.
- **Micro-interactions:** Hovering over a card triggers a border color transition to `rgba(99, 102, 241, 0.3)` and elevates copy affordances.

### Checkboxes & Radios
- `18x18px` boxes with `5px` corner radius. Unchecked: `1.5px solid rgba(15, 23, 42, 0.2)`. Checked: `linear-gradient(135deg, #6366f1, #8b5cf6)` with a crisp white centered checkmark.

### Telemetry Sparklines
- Integrated SVG micro-charts embedded directly into list rows showing real-time 24-hour click trajectories using a smooth gradient stroke (`#6366f1` to `#8b5cf6`) with translucent area fill.