# Meridian — Change Log

This file is maintained by the Planner Agent.
Every change made to the codebase is recorded here — what was changed, why, which agent did it, and which files were touched.

---

## How to Read This File

Each entry follows this structure:

```
### [Sprint N] — Agent Name — Short description
Date: YYYY-MM-DD
Commit: <hash>

**Why:** reason the change was needed
**Files changed:**
- path/to/file.ext — what changed and why

**Verified by Tester:** yes / no / pending
```

---

## Sprint 0 — Planning & Setup

---

### [S0-1] Planner — Project scaffolding files
Date: 2026-02-28
Commit: `50dd171`

**Why:** Establish the agent system and initial project plan before writing any code.

**Files changed:**
- `AGENTS.md` *(new)* — Defines all 7 agents (Planner, Globe, Audio, Share, UI, Story, Tester) with responsibilities, owned files, backlogs, invocation format, and constraints
- `PLAN.md` *(new)* — First planner report: 5 bugs, 12 UX improvements, 12 new features, all prioritised and agent-assigned
- `netlify.toml` *(new)* — Deployment configuration for Netlify hosting

**Verified by Tester:** n/a (no code changes)

---

### [S0-2] Planner — Rewrite plan as mobile-first PWA strategy
Date: 2026-02-28
Commit: `1294bdd`

**Why:** User confirmed the target is a mobile app. The entire plan was re-evaluated through a mobile lens. Original desktop-first priorities were replaced with a PWA-first approach.

**Files changed:**
- `PLAN.md` *(updated)* — Completely rewritten:
  - Added mobile audit (M0–M7): 7 real blockers found
  - Strategy set to PWA (Progressive Web App)
  - Added mobile layout wireframes for globe and player phases
  - Reorganised all items into P0→P4 mobile-first priority order
  - Added 4-sprint roadmap with per-agent assignments

**Verified by Tester:** n/a (no code changes)

---

## Sprint 1 — "Make It Work on Mobile"

---

### [S1-1] UI Agent — Fix all P0 mobile blockers
Date: 2026-02-28
Commit: `b51735a`

**Why:** Five blockers were making the app broken or unusable on mobile devices before any of the Sprint 1 work could begin.

---

#### M0 — Waveform canvas overflows on iPhone
**Problem:** `Player.tsx` hardcoded `canvas width = 400px`. iPhone 15 CSS viewport = 390px, causing the canvas to clip 10px off the right edge on every modern iPhone.

**Fix:** Canvas now measures its container div's actual width on mount and on every `resize` event, capped between 280px and 560px.

**Files changed:**
- `src/app/components/Player.tsx`
  - Added `canvasContainerRef` (ref to container div) and `canvasSizeRef` (tracks current `{ w, h }`)
  - Replaced `const w = 400; const h = 120` with a `setupCanvas()` function that reads `canvasContainerRef.current.getBoundingClientRect().width`
  - `draw()` loop now reads `const { w, h } = canvasSizeRef.current` at the start of each frame
  - Added `window.addEventListener("resize", setupCanvas)` with proper cleanup
  - Canvas wrapped in `<div ref={canvasContainerRef} style={{ width: "100%" }}>` inside a `w-full` motion.div with `maxWidth: 560`

---

#### M1 — Content sits behind iPhone notch and home indicator
**Problem:** `index.html` was missing `viewport-fit=cover`. No component used `env(safe-area-inset-*)`. On iPhones, the Tracklist bar (`fixed bottom-0`) and compose buttons were obscured by the 34px home indicator. The header was obscured by the status bar on notched devices.

**Fix:** Added `viewport-fit=cover` to the viewport meta tag and applied `env(safe-area-inset-*)` padding to every fixed-position element.

**Files changed:**
- `index.html` — Added `viewport-fit=cover` to viewport meta
- `src/app/components/Header.tsx` — Added `paddingTop: "calc(16px + env(safe-area-inset-top))"` inline style (overrides the Tailwind `py-4` top padding)
- `src/app/components/Tracklist.tsx` — Added `paddingBottom: "calc(16px + env(safe-area-inset-bottom))"` inline style
- `src/app/App.tsx` — Replaced Tailwind `bottom-20/bottom-24/bottom-10` classes on all 4 floating bottom elements with inline `style={{ bottom: "calc(Xpx + env(safe-area-inset-bottom))" }}`
- `src/app/components/Player.tsx` — Added `paddingTop` and `paddingBottom` with `env(safe-area-inset-*)` to the full-screen container
- `src/app/components/Interstitial.tsx` — Added `paddingTop` and `paddingBottom` with `env(safe-area-inset-*)` to the full-screen container

---

#### M2 — Progress bar not scrubbable on mobile
**Problem:** `Player.tsx` progress bar only had `onMouseDown/Move/Up` handlers. Touch devices received no events, making it impossible to seek on mobile.

**Fix:** Added `onTouchStart`, `onTouchMove`, `onTouchEnd` handlers that mirror the mouse handler logic using `e.touches[0].clientX` / `e.changedTouches[0].clientX`. The progress bar is also now `flex: 1` (not fixed `300px`) within a `maxWidth: 560` container so it fills the available width on any screen.

**Files changed:**
- `src/app/components/Player.tsx`
  - Added `handleBarTouchStart`, `handleBarTouchMove`, `handleBarTouchEnd` callbacks
  - `handleBarTouchMove` calls `e.preventDefault()` to suppress page scroll while scrubbing
  - Progress bar `div`: replaced `width: 300` with `flex: 1`; added the three touch handlers
  - Parent `motion.div`: added `w-full` class and `maxWidth: 560` style

---

#### M3 — "Add to Home Screen" shows a plain webpage, not an app
**Problem:** `index.html` had no PWA metadata. iOS Safari and Android Chrome had no information to treat the app as installable, show the correct status bar colour, or display the app name on the home screen.

**Fix:** Added 6 PWA meta tags.

**Files changed:**
- `index.html`
  - `<meta name="theme-color" content="#070a0f">` — browser chrome matches app background
  - `<meta name="apple-mobile-web-app-capable" content="yes">` — iOS full-screen mode
  - `<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">` — status bar overlays the app
  - `<meta name="apple-mobile-web-app-title" content="Meridian">` — home screen label
  - `<meta name="mobile-web-app-capable" content="yes">` — Android Chrome equivalent
  - `<meta name="description" content="Drop pins on the globe. Hear the world as music.">` — share preview text

---

#### M6 — White flash on iOS before app paints
**Problem:** `theme.css` `:root` sets `--background: #ffffff` (the Radix UI / shadcn default light mode). React takes ~100–200ms to paint on mobile. During that window, iOS renders the raw HTML background, showing a bright white flash before the dark app appears.

**Fix:** Added an inline `<style>` block directly in `index.html` that sets `html, body { background: #070a0f; margin: 0; }` before any scripts load. This runs synchronously during HTML parsing, eliminating the flash.

**Files changed:**
- `index.html` — Added `<style>html, body { background: #070a0f; margin: 0; }</style>` in `<head>`

---

**Verified by Tester:** pending

---

---

## Sprint 1 — continued

---

### [S1-2] Globe Agent — Curate city list; raise snap radius
Date: 2026-02-28
Commit: `1a1ede1`

**Why:** City snap was unreliable on mobile — radius too tight and city list had gaps in coverage for Africa and Central Asia.

**Files changed:**
- `src/app/components/countryData.ts` — Curated city list to 141 well-distributed cities; raised snap radius from 300 km to 500 km

**Verified by Tester:** yes

---

### [S1-3] Globe Agent — Fix point-in-polygon wraparound bug
Date: 2026-02-28
Commit: `67f9fb5`

**Why:** Mexico (west of −90°) was resolving to India. The polygon ray-casting algorithm did not handle antimeridian-crossing polygons, causing longitudes near ±180° to be misclassified.

**Files changed:**
- `src/app/components/Globe.tsx` — Fixed ray-casting to normalise longitudes relative to the test point before intersection test

**Verified by Tester:** yes

---

### [S1-4] Planner — Add GEOGRAPHY.md
Date: 2026-02-28
Commit: `4e23103`

**Why:** Document the full inventory of mapped cities, countries, and water bodies for future maintenance reference.

**Files changed:**
- `GEOGRAPHY.md` *(new)* — Full listing of all cities, countries, and named water bodies in the dataset

**Verified by Tester:** n/a (docs only)

---

### [S1-5] Globe Agent — Fix B2: dead scale keys in REGION_SCALE_MAP
Date: 2026-02-28
Commit: `670f1e8`

**Why:** Several region names in `REGION_SCALE_MAP` did not match the strings produced by the polygon lookup, leaving those regions falling through to the default "Major" scale regardless of location.

**Files changed:**
- `src/app/components/AudioEngine.ts` — Corrected mismatched region key strings in `REGION_SCALE_MAP`
- `src/app/components/countryData.ts` — Expanded city list from 141 to 202 cities

**Verified by Tester:** yes

---

### [S1-6] Story Agent — Fix B3: getContinent("Central America") returning unknown
Date: 2026-02-28
Commit: `91175cb`

**Why:** `storyGenerator.ts` had no continent mapping for "Central America", causing the story generator to emit "the unknown" as the continent name in generated text.

**Files changed:**
- `src/app/components/storyGenerator.ts` — Added "Central America" → "the Americas" mapping in the continent lookup

**Verified by Tester:** yes

---

### [S1-7] Globe Agent — Fix B1: pin ID collision on touch remove + re-add
Date: 2026-02-28
Commit: `2527462`

**Why:** Pin IDs were generated from a hash of lat/lng which collided when the same city was dropped twice after removal, breaking the Tracklist's key-based reconciliation.

**Files changed:**
- `src/app/components/Globe.tsx` — Replaced hash-based ID generation with a monotonically incrementing counter

**Verified by Tester:** yes

---

### [S1-8] Globe Agent — Add P2g night-side hemisphere shading
Date: 2026-02-28
Commit: `218a21e`

**Why:** The globe had uniform lighting. Adding a subtle night-side darkening gives the globe visual depth and a sense of the day/night terminator.

**Files changed:**
- `src/app/components/Globe.tsx` — Added radial gradient overlay on the hemisphere opposite the light source; parameterised light direction

**Verified by Tester:** yes

---

### [S1-9] Share Agent — Implement P3a URL deep linking + Copy Link button
Date: 2026-02-28
Commit: `c30c1ae`

**Why:** Users had no way to share a specific composition. Adding URL-encoded pin state means a shared link recreates the exact globe state and auto-triggers generation.

**Files changed:**
- `src/app/shareUtils.ts` *(new)* — Encode/decode pin list to/from a compact URL query string
- `src/app/App.tsx` — On load, parse URL params and restore pins; add "Copy Link" button to player UI

**Verified by Tester:** yes

---

### [S1-10] Globe Agent — Split cityData.ts; expand to 257 cities
Date: 2026-02-28
Commit: `363de1c`

**Why:** `countryData.ts` was growing too large. Splitting city data into its own file improves maintainability. Coverage was also extended with 55 new cities across underrepresented regions.

**Files changed:**
- `src/app/components/cityData.ts` *(new)* — All city records extracted to dedicated file
- `src/app/components/countryData.ts` — Removed city array; imports from `cityData.ts`
- `GEOGRAPHY.md` *(updated)* — Reflects new 257-city count and maintenance notes

**Verified by Tester:** yes

---

### [S1-11] Globe Agent — Expand city coverage to 400; fix Africa longitude bug
Date: 2026-02-28
Commit: `2403e39`

**Why:** Several African cities had incorrect longitudes (sign error), placing them in the ocean. Coverage was also expanded to 400 total cities for better global distribution.

**Files changed:**
- `src/app/components/cityData.ts` — Corrected longitude signs for affected African cities; added ~143 new cities to reach 400 total

**Verified by Tester:** yes

---

### [S1-12] UI Agent — Add favicon, apple-touch-icon, and OG social meta tags
Date: 2026-02-28
Commit: `4cc0994`

**Why:** The app had no favicon (showing a blank tab icon) and no Open Graph tags, meaning shared links on social media showed no preview image or title.

**Files changed:**
- `index.html` — Added `<link rel="icon">`, `<link rel="apple-touch-icon">`, `og:title`, `og:description`, `og:image`, `twitter:card` meta tags
- `public/` — Added favicon and apple-touch-icon assets

**Verified by Tester:** yes

---

## Sprint 2 — "Volume & Loudness"

---

### [S2-1] Audio Agent — Fix low volume: normalization + dynamics compression
Date: 2026-03-02
Commit: `f98c3ef`

**Why:** User testing revealed the composition was inaudibly quiet even at full device volume. Root cause: accumulated attenuation across the signal chain — master bus peaked at 0.75, dry split at 0.45, per-layer gains as low as 0.008 — left the rendered buffer at roughly −12 to −20 dBFS with no stage to recover level.

**Fix:**
1. **Post-render normalization** — after `offline.startRendering()`, the buffer is scanned for its peak sample and scaled so it peaks at 0.92 (−0.7 dBFS). Guarantees maximum loudness regardless of pin combination.
2. **DynamicsCompressor in offline render** — inserted before `offline.destination` (threshold −24 dB, ratio 4:1, soft knee 30 dB). Brings up quiet passages before normalization so the gain is applied to the whole piece, not just the loudest spike.
3. **DynamicsCompressor in playback chain** — same settings added between `masterGain` and `analyser` in `ensureCtx()`, benefiting in-browser playback.

**Files changed:**
- `src/app/components/AudioEngine.ts`
  - Added `normalizeBuffer()` helper function
  - `renderComposition()` — inserts compressor node, calls `normalizeBuffer()` on rendered buffer
  - `ensureCtx()` — inserts compressor between `masterGain` and `analyser`

**Verified by Tester:** yes
