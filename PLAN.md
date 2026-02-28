# Meridian — Planner Report
_Last updated: 2026-02-28_

---

## Bugs Found (Real Issues in the Current Code)

### B1 — Pin ID collision on remove + re-add `Globe.tsx`
The touch handler uses `currentPins.length + 1` to assign a new pin ID, but the
mouse handler uses `pinIdCounter.current`. If pins are removed and re-added via touch,
IDs will collide with earlier pins. **Owner: Globe Agent**

### B2 — Unreachable keys in `REGION_SCALE_MAP` `AudioEngine.ts`
The following keys are mapped in the audio engine but are never returned by
`getMusicalRegion()` in `countryData.ts` — they are dead code:
- `"Japan"` → `countryData` returns `"East Asia"` (same scale, but the key is wasted)
- `"Latin America"` → `countryData` returns `"South America"` or `"Central America"`
- `"Scandinavia"` → `countryData` returns `"Northern Europe"`
- `"Mediterranean"` → `countryData` returns `"Southern Europe"`

**Owner: Audio Agent** (clean up the map, verify scale assignments)

### B3 — `getContinent("Japan")` returns `"the unknown"` `storyGenerator.ts`
`getContinent` checks `r.includes("asia")` but the musical region for Japan is
`"East Asia"` which does contain "asia" — BUT when a pin's `musicalRegion` is directly
`"Japan"` (it shouldn't be, but defensive check needed), it would fall through.
More importantly: "Oceania" passes through correctly, but several compound strings
like "Central America" may match the wrong branch.
**Owner: Story Agent** (audit all continent checks)

### B4 — Touch scrubbing missing in Player `Player.tsx`
The progress bar only has mouse event handlers. On mobile, the seeker cannot be
dragged. The bar is fully non-functional on touch devices.
**Owner: UI Agent**

### B5 — City snap radius too small for most clicks `Globe.tsx`
`MAX_CITY_DIST_RAD = 1.5° (~165 km)` and is only applied when NO country polygon
is matched. Clicking anywhere inside a country polygon that has a nearby city will
NOT get a city label — only if you click on a tiny island with no polygon.
Most clicks on large countries (USA, Russia, China) show the country name only,
never a city, even if you click right on top of one.
**Owner: Globe Agent** (expand city snapping to within-polygon clicks too)

---

## Improvements (Existing Features That Need Work)

### I1 — Compose button logic is duplicated `App.tsx`
There are two separate `AnimatePresence` blocks for the Compose button:
one for 3–7 pins and another for exactly 8. Same action, different styling.
Should be a single conditional block.
**Owner: UI Agent**

### I2 — No way to skip the Interstitial `Interstitial.tsx`
The loading animation plays for ~12–14 seconds and cannot be skipped. Returning
users who re-compose will sit through the whole sequence again.
**Owner: UI Agent** (add a subtle "skip" or click-anywhere-to-skip)

### I3 — Globe auto-rotate resumes even mid-hover `Globe.tsx`
After 5 seconds of no dragging, auto-rotate resumes even if the user is still
hovering over the globe. Should only resume if the mouse has left the globe.
**Owner: Globe Agent**

### I4 — Composition duration is hardcoded `AudioEngine.ts`
`readonly duration: number = 80` — there is no way to change this. A 60/90/120s
option would let users get a longer piece for more pins.
**Owner: Audio Agent**

### I5 — Progress bar and waveform are fixed pixel widths `Player.tsx`
Waveform canvas: `400×120px`. Progress bar: `300px`. Both are hardcoded pixel
values. On mobile these are fine, but on wide screens they look undersized.
**Owner: UI Agent** (make both scale with viewport width, capped at ~600px)

### I6 — Album epigraphs are too few `albumTitle.ts`
Only 10 epigraph strings for potentially hundreds of unique compositions.
Frequent users will see repeats immediately.
**Owner: Story Agent** (expand to 30+)

### I7 — Story templates repeat quickly `storyGenerator.ts`
6 strings per slot × 6 slots = narrow variety. Heavy users will see the same
lines within a few compositions.
**Owner: Story Agent** (expand each slot to 12–15 options)

### I8 — No country highlight on hover `Globe.tsx`
The tooltip shows the country name, but the country polygon itself has no
visual response on hover (fill change, border highlight). The globe feels
unresponsive to mouse movement.
**Owner: Globe Agent**

### I9 — `getRegionLabel()` shows scale name, not region name `AudioEngine.ts`
In the Player and Tracklist, each pin shows its scale (e.g. "Pentatonic Major")
instead of its musical region (e.g. "West Africa"). The scale name is less
meaningful to users.
**Owner: Audio Agent / UI Agent** (export a `getRegionName()` helper and swap)

### I10 — No visual indication that clicking at max pins does nothing `Globe.tsx`
When 8 pins are placed, clicking the globe silently does nothing. No cursor
change, no feedback. User might think the app is broken.
**Owner: Globe Agent** (change cursor to `not-allowed` at max, or show a flash)

### I11 — Tracklist remove affordance is unclear `Tracklist.tsx`
The `×` only appears on hover via `opacity-0 group-hover:opacity-100`. On mobile
(no hover state), there is no visible indication that tapping a pill removes it.
**Owner: UI Agent** (always show a small × on mobile, hide on desktop unless hovered)

### I12 — No keyboard shortcuts anywhere
Space/R/Escape/Backspace do nothing. This is a significant gap for desktop UX.
**Owner: UI Agent**

---

## New Features (Interesting Additions)

### F1 — URL Share / Deep Linking ⭐ HIGH VALUE
Encode pins into the URL hash: `#v1;lat,lng;lat,lng;...`
- Any composition becomes a shareable link
- Globe restores pins on load from hash
- "Copy link" button appears in the Player view
- Works entirely client-side, zero infrastructure needed
**Owner: Share Agent**

### F2 — Preset Journeys / Curated Routes ⭐ HIGH VALUE
A small panel or button that offers famous multi-pin routes:
- "Silk Road" (7 pins: Rome → Istanbul → Tehran → Samarkand → Delhi → Xi'an → Beijing)
- "Trans-Atlantic" (4 pins: New York → Lisbon → Dakar → Rio)
- "Pacific Ring" (6 pins: Tokyo → Manila → Sydney → Auckland → Honolulu → Vancouver)
- "Random Route" — drops 5 random pins
Great for onboarding, shows the app's range immediately.
**Owner: Globe Agent + UI Agent**

### F3 — Search / Fly-to Location ⭐ HIGH VALUE
A small search input in the header: type a city or country name, globe animates
(rotates and "flies") to face that location, then user clicks to drop the pin.
**Owner: Globe Agent + UI Agent**

### F4 — Loop Mode + Composition Duration Picker
A toggle in the Player for loop, and a duration selector (60 / 90 / 120s)
shown before composing (in the Header or as a settings panel).
**Owner: Audio Agent + UI Agent**

### F5 — Waveform + Route Card Export (Share as Image)
A "Share Image" button in the Player that generates a PNG:
- Black background with the route on a mini globe
- Album title, pin cities, waveform snapshot
- Downloadable and shareable to social media
**Owner: UI Agent + Globe Agent** (mini globe render)

### F6 — Composition History (LocalStorage Gallery)
After composing, save the pin set + album meta to LocalStorage.
A small "History" icon in the header opens a drawer showing past compositions.
Click any to restore the pins and re-compose.
**Owner: Share Agent + UI Agent**

### F7 — Night-Side Globe Shading
The globe currently renders uniformly. Add a directional light source:
the far hemisphere gets a subtle darkening gradient, giving depth and realism.
Also improves the feeling of the globe as a 3D object.
**Owner: Globe Agent**

### F8 — Country Hover Highlight (filled polygon)
When hovering, fill the hovered country polygon with a very subtle tinted color
(e.g. `rgba(255,255,255,0.06)` → `rgba(255,255,255,0.12)` on hover).
**Owner: Globe Agent** (tracked as I8 above — elevating to feature if complex)

### F9 — Pin Drag Reordering in Tracklist
Drag a pill in the Tracklist to reorder it. This changes:
- The order of connecting arcs on the globe
- The story narrative (start/end cities change)
- The composition (layer sequencing)
**Owner: UI Agent**

### F10 — AI-Generated Story Mode (Claude API, opt-in)
An optional "AI Story" mode where the interstitial text is generated by Claude
using the actual cities, regions, and scales as context. Falls back silently
to the local generator if no API key is provided.
**Owner: Story Agent**

### F11 — Optional Rhythm Layer
A toggle before composing: "Add pulse" — adds a slow organic rhythm layer
(not a beat, more like breathing-in-time). This is a new layer in the AudioEngine
on top of the existing 6.
**Owner: Audio Agent**

### F12 — Atmosphere Visualisation on Globe
While in map phase, softly color the globe ocean or land by the detected
atmosphere type of the current pin set as it evolves (arctic = cool blue tint,
tropical = warm amber, oceanic = deep teal).
**Owner: Globe Agent**

---

## Priority Order

| Priority | ID  | Description                        | Agent(s)         | Effort |
|----------|-----|------------------------------------|------------------|--------|
| 🔴 P1   | B5  | City snapping inside polygons      | Globe            | Small  |
| 🔴 P1   | B1  | Pin ID collision on touch          | Globe            | Small  |
| 🔴 P1   | B4  | Touch scrubbing in Player          | UI               | Small  |
| 🔴 P1   | B2  | Dead keys in REGION_SCALE_MAP      | Audio            | Small  |
| 🟠 P2   | I8  | Country hover highlight            | Globe            | Medium |
| 🟠 P2   | I3  | Auto-rotate resumes on hover       | Globe            | Small  |
| 🟠 P2   | I10 | Max pins cursor/feedback           | Globe            | Small  |
| 🟠 P2   | I12 | Keyboard shortcuts                 | UI               | Small  |
| 🟠 P2   | I2  | Skip interstitial                  | UI               | Small  |
| 🟠 P2   | I5  | Responsive waveform/progress bar   | UI               | Small  |
| 🟠 P2   | I9  | Show region name not scale name    | Audio + UI       | Small  |
| 🟡 P3   | F1  | URL sharing                        | Share            | Medium |
| 🟡 P3   | F7  | Night-side globe shading           | Globe            | Medium |
| 🟡 P3   | F2  | Preset journeys                    | Globe + UI       | Medium |
| 🟡 P3   | I7  | Expand story templates             | Story            | Small  |
| 🟡 P3   | I6  | Expand epigraphs                   | Story            | Small  |
| 🟡 P3   | I4  | Configurable composition duration  | Audio + UI       | Medium |
| 🟢 P4   | F3  | Search / fly-to                    | Globe + UI       | Large  |
| 🟢 P4   | F6  | Composition history                | Share + UI       | Large  |
| 🟢 P4   | F9  | Tracklist drag-reorder             | UI               | Medium |
| 🟢 P4   | F4  | Loop mode                          | Audio + UI       | Small  |
| 🟢 P4   | F11 | Optional rhythm layer              | Audio            | Medium |
| 🟢 P4   | F5  | Share as image                     | UI + Globe       | Large  |
| 🔵 P5   | F10 | AI story mode (Claude)             | Story            | Large  |
| 🔵 P5   | F12 | Atmosphere on globe                | Globe            | Large  |
