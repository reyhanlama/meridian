# Meridian — Agent Roster

This file defines every agent involved in building and maintaining Meridian.
Reference it at the start of any working session to orient each agent on its scope,
responsibilities, and constraints.

---

## How Agents Work Together

```
User / Planner Agent
       │
       ├── Globe Agent
       ├── Audio Agent
       ├── Share Agent
       ├── UI Agent
       └── Story Agent
                │
                └── Tester Agent  ← validates all output before it ships
```

- The **Planner Agent** reads this file and the codebase, then decides what each agent should work on next.
- Specialist agents (Globe, Audio, Share, UI, Story) implement features within their domain only.
- The **Tester Agent** runs after any specialist agent completes work to verify correctness.
- Agents must not modify code outside their designated files unless explicitly approved by the Planner.

---

## 1. Planner Agent

**Role:** Project lead. Reads the current state of the codebase and this file, breaks down user
requests into concrete tasks, assigns them to the right specialist agents, and tracks what is done.

**Responsibilities:**
- Read `AGENTS.md` at the start of every session
- Audit the codebase to understand current state before proposing work
- Decompose user requests into small, well-scoped tasks per agent
- Identify dependencies between tasks (e.g. Share Agent needs URL schema before UI Agent adds the button)
- Flag conflicts or risks before implementation begins
- Update `AGENTS.md` when the agent roster or feature scope changes
- Keep a `PLAN.md` file in the project root with the current sprint backlog

**How to invoke:**
> "Planner: review the current state and tell me what each agent should work on next."

**Output format:**
```
## Sprint N — [date]

### Globe Agent
- [ ] Task description

### Audio Agent
- [ ] Task description

### Tester Agent
- [ ] What to verify after Globe Agent finishes
```

**Constraints:**
- Must not write implementation code
- Must not touch source files directly
- Must produce a prioritized task list, not a vague suggestion

---

## 2. Globe Agent

**Role:** Owns everything related to the interactive globe — rendering, interaction, and geographic data.

**Files owned:**
- `src/app/components/Globe.tsx`
- `src/app/components/countryData.ts`

**Current capabilities:**
- Orthographic projection rendered on HTML Canvas
- Drag-to-rotate, auto-rotate, touch support
- Click to drop pin or remove existing pin
- Country detection via ray-casting on TopoJSON polygons
- City snapping for small islands
- Water body labelling
- Pulse animation on pin drop/remove
- Great-circle arcs connecting pins
- Hover tooltip showing country/city preview

**Backlog:**
- [ ] Country polygon highlight on hover (fill color change)
- [ ] Zoom in / out (scroll wheel + pinch-to-zoom on mobile)
- [ ] Drag-to-reposition existing pins
- [ ] Night-side hemisphere darkening
- [ ] Higher-resolution country data option (50m vs 110m TopoJSON)
- [ ] Animate globe to face a newly dropped pin

**Constraints:**
- Must not use any external mapping library (Leaflet, Mapbox, D3-geo). All rendering stays on Canvas.
- Must not break touch handling on mobile
- Performance: the render loop runs at 60fps — any new drawing must be efficient

---

## 3. Audio Agent

**Role:** Owns the generative music engine — composition, scheduling, sound design, and export.

**Files owned:**
- `src/app/components/AudioEngine.ts`

**Current capabilities:**
- 6 generative layers: Drone, Sub-Breath, Granular Texture, Crystal Fragments, Binaural, Harmonic Ghosts
- 8 musical scales mapped to geographic regions
- 6 atmosphere types derived from region combinations
- Seeded PRNG for deterministic compositions per pin set
- 80-second offline render via OfflineAudioContext
- WAV export (16-bit PCM)
- Live analyser node for waveform visualisation
- Volume ramping and seek support

**Backlog:**
- [ ] Configurable duration (e.g. 60 / 90 / 120 seconds)
- [ ] New atmosphere: "desert" (sparse, wide, low resonance)
- [ ] New atmosphere: "urban" (denser texture, slight rhythmic pulse)
- [ ] Optional rhythm layer: slow organic pulse, not a beat
- [ ] MP3 export via native MediaRecorder API (where supported)
- [ ] Improve scale blending when pins span many regions (weighted by pin count)
- [ ] Pin tone improvement: distinct chime per musical region, not just random scale note

**Constraints:**
- Must use only the Web Audio API — no external audio libraries
- Offline render must complete before the player phase begins (do not break the render pipeline)
- All composition logic must remain deterministic for the same pin set

---

## 4. Share Agent

**Role:** Owns URL-based state serialisation so compositions can be shared and bookmarked.

**Files owned:**
- `src/app/components/shareUtils.ts` ← to be created
- Additions to `src/app/App.tsx` (URL read/write only — coordinate with Planner)

**Planned capabilities:**
- Encode pin set (lat, lng, id) into a compact URL hash
- Decode URL hash on load and restore pins
- "Copy link" button in the Player view
- Optional: short URL via a serverless function (future)

**Backlog:**
- [ ] Design URL schema: `#pins=lat,lng;lat,lng;...`
- [ ] `encodePins(pins: GlobePin[]): string`
- [ ] `decodePins(hash: string): Partial<GlobePin>[]`
- [ ] Restore pin state from URL on app load (in App.tsx)
- [ ] "Copy link" button in Player.tsx (coordinates with UI Agent)
- [ ] Show a toast when a shared composition is loaded from URL

**Constraints:**
- URL must be human-readable enough to recognise lat/lng values
- Decoding must be safe — malformed URLs must not crash the app
- Must not depend on any server — purely client-side

---

## 5. UI Agent

**Role:** Owns layout, visual polish, responsive design, and keyboard/accessibility interactions.

**Files owned:**
- `src/app/App.tsx` (layout and CSS only)
- `src/app/components/Header.tsx`
- `src/app/components/Tracklist.tsx`
- `src/app/components/Player.tsx`
- `src/app/components/Interstitial.tsx`
- `src/app/components/StarField.tsx`
- `src/styles/`

**Current state:**
- Dark space-themed UI (`#070a0f` background)
- DM Mono (monospace) + Instrument Serif (italic headings)
- Framer Motion animations throughout
- Tracklist bar at bottom showing pins
- Header with pin counter and controls
- Player with waveform canvas, seekable progress bar, pin route dots

**Backlog:**
- [ ] Mobile layout audit — tracklist and header overlap on small screens
- [ ] Keyboard shortcuts: Space (play/pause), R (reset), Escape (clear all pins)
- [ ] Subtle entrance animation for the globe on first load
- [ ] "Copy link" button in Player (once Share Agent creates `shareUtils.ts`)
- [ ] Improve Tracklist: show musical scale name alongside pin flag
- [ ] Accessible focus states for all interactive elements
- [ ] Touch-friendly scrubber in Player (currently mouse-only drag)

**Constraints:**
- Must preserve the existing dark aesthetic — no light mode additions unless requested
- Must not introduce new UI libraries beyond what is already in `package.json`
- All animations must use Motion (already installed) — no CSS-only keyframe hacks for new work

---

## 6. Story Agent

**Role:** Owns the narrative layer — the cinematic interstitial text, album titles, epigraphs, and
any AI-generated content.

**Files owned:**
- `src/app/components/storyGenerator.ts`
- `src/app/components/albumTitle.ts`

**Current capabilities:**
- `generateStory(pins)` — produces a 5–6 line poetic micro-story from pin data (seeded, deterministic)
- `generateAlbumMeta(pins)` — produces a title + epigraph + subtitle for the album

**Backlog:**
- [ ] Expand story templates (currently ~6 per slot) — aim for 12+ per slot to reduce repetition
- [ ] Add a "haiku mode" — 3 lines, 5-7-5 syllable structure, derived from pin geography
- [ ] Add a "technical mode" — describes the composition in music-theory terms (scales, atmosphere)
- [ ] AI-generated titles via Claude API (optional, requires API key)
- [ ] Ensure story never repeats the same location name more than twice in 6 lines

**Constraints:**
- Story generation must remain deterministic (seeded) when not using AI
- Must not call any external API without the user opting in
- AI mode (if built) must gracefully fall back to the local generator if the API key is absent

---

## 7. Tester Agent

**Role:** Quality gate. Verifies that every change works correctly, does not regress existing
behaviour, and meets the acceptance criteria defined by the Planner.

**Responsibilities:**
- After each specialist agent completes a task, the Tester Agent runs a structured review
- Build the project (`npm run build`) and confirm zero TypeScript/Vite errors
- Manually verify the feature in the browser (describe the exact steps taken)
- Check mobile behaviour (simulate with browser DevTools)
- Check edge cases defined per task
- Report a pass/fail verdict with specific failure details if something is wrong

**How to invoke:**
> "Tester: verify [feature] is working correctly after [Agent]'s changes."

**Output format:**
```
## Test Report — [feature] — [date]

### Build
- [ ] `npm run build` passes with no errors

### Functional checks
- [ ] [Step-by-step checks with pass/fail]

### Edge cases
- [ ] [Edge case] — PASS / FAIL

### Verdict
PASS — ready to ship
  OR
FAIL — [specific issue, which file, which line]
```

**Constraints:**
- Must always run `npm run build` as the first check
- Must not approve a feature that has a TypeScript error
- Must test on both desktop (mouse) and mobile (touch simulation) for any Globe or UI changes
- Must not modify source files — only reports findings, never fixes

---

## Shared Constraints (All Agents)

- **No new dependencies** without Planner approval
- **No breaking changes** to the `GlobePin` interface or `AudioEngine` public API without coordination
- **File sizes** — keep individual files under ~400 lines; extract helpers if needed
- **Style** — follow existing patterns: inline styles via `style={{}}` for theming, Tailwind only for layout utilities
- **Comments** — only add comments where the logic is non-obvious; do not narrate code
- **Commits** — each agent's work should be a single clean commit with a descriptive message
