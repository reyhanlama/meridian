// ============================================================
// Meridian Audio Engine — Endel-inspired Generative Ambient
// ============================================================
// Produces evolving, organic soundscapes: deep breathing drones,
// granular textures, crystalline fragments, binaural detuning,
// and long reverb tails. No rigid beats — everything flows.
// ============================================================

// --- Tuning system: Just-intonation-flavored frequencies ---

const SCALES: Record<string, number[]> = {
  "Pentatonic Major":   [130.8, 146.8, 164.8, 196.0, 220.0],
  "Phrygian Dominant":  [130.8, 138.6, 164.8, 174.6, 196.0, 207.7],
  "Pentatonic Minor":   [130.8, 155.6, 174.6, 196.0, 233.1],
  "Dorian":             [130.8, 146.8, 155.6, 174.6, 196.0, 220.0, 233.1],
  "Raga Bhairavi":      [130.8, 138.6, 155.6, 174.6, 196.0, 207.7, 233.1],
  "Whole Tone":         [130.8, 146.8, 164.8, 185.0, 207.7, 233.1],
  "Harmonic Minor":     [130.8, 146.8, 155.6, 174.6, 196.0, 207.7, 246.9],
  "Major":              [130.8, 146.8, 164.8, 174.6, 196.0, 220.0, 246.9],
};

const REGION_SCALE_MAP: Record<string, string> = {
  "West Africa":     "Pentatonic Major",
  "Central Africa":  "Pentatonic Major",
  "Central America": "Pentatonic Major",
  "South America":   "Pentatonic Major",
  "Middle East":     "Phrygian Dominant",
  "Central Asia":    "Phrygian Dominant",
  "East Asia":       "Pentatonic Minor",
  "Southeast Asia":  "Pentatonic Minor",
  "Northern Europe": "Dorian",
  "South Asia":      "Raga Bhairavi",
  "Oceania":         "Whole Tone",
  "Southern Europe": "Harmonic Minor",
  "North Africa":    "Harmonic Minor",
  "Western Europe":  "Major",
  "Eastern Europe":  "Major",
  "North America":   "Major",
  "East Africa":     "Major",
  "Southern Africa": "Major",
  // Oceans
  "Atlantic Ocean":    "Dorian",
  "Indian Ocean":      "Raga Bhairavi",
  "Arctic Ocean":      "Pentatonic Minor",
  "Southern Ocean":    "Whole Tone",
  // Seas
  "Mediterranean Sea": "Harmonic Minor",
  "Black Sea":         "Harmonic Minor",
  "Caspian Sea":       "Phrygian Dominant",
  "Red Sea":           "Phrygian Dominant",
  "Persian Gulf":      "Phrygian Dominant",
  "Arabian Sea":       "Raga Bhairavi",
  "Bay of Bengal":     "Raga Bhairavi",
  "South China Sea":   "Pentatonic Minor",
  "Yellow Sea":        "Pentatonic Minor",
  "Sea of Japan":      "Pentatonic Minor",
  "Bering Sea":        "Pentatonic Minor",
  "Baltic Sea":        "Dorian",
  "North Sea":         "Dorian",
  "Norwegian Sea":     "Dorian",
  "Caribbean Sea":     "Pentatonic Major",
  "Gulf of Mexico":    "Pentatonic Major",
  "Hudson Bay":        "Dorian",
  "Coral Sea":         "Whole Tone",
  "Tasman Sea":        "Whole Tone",
};

function getScaleForRegion(region: string): number[] {
  const scaleName = REGION_SCALE_MAP[region] || "Major";
  return SCALES[scaleName];
}

function getScaleNameForRegion(region: string): string {
  return REGION_SCALE_MAP[region] || "Major";
}

// --- Build master scale from blended regions ---

function buildMasterScale(regions: string[]): number[] {
  const freqSet = new Set<number>();
  for (const region of regions) {
    for (const freq of getScaleForRegion(region)) {
      freqSet.add(freq);
    }
  }
  return Array.from(freqSet).sort((a, b) => a - b);
}

// --- Seeded PRNG ---

function mulberry32(seed: number) {
  return () => {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

// --- Atmosphere detection (replaces rigid "mood") ---

type Atmosphere = "arctic" | "oceanic" | "tropical" | "meditative" | "celestial" | "earthen";

function detectAtmosphere(regions: string[]): Atmosphere {
  const scaleNames = new Set(regions.map(getScaleNameForRegion));
  const cold = ["Northern Europe", "Scandinavia"];
  const ocean = ["Oceania", "Pacific Ocean", "Australia"];
  const warm = ["South Asia", "West Africa", "Central Africa", "Central America", "South America", "Latin America"];

  if (regions.every(r => cold.includes(r))) return "arctic";
  if (regions.filter(r => cold.includes(r)).length >= regions.length * 0.5) return "arctic";
  if (regions.every(r => ocean.includes(r))) return "oceanic";
  if (regions.filter(r => ocean.includes(r)).length >= regions.length * 0.5) return "oceanic";
  if (regions.every(r => warm.includes(r))) return "tropical";
  if (regions.filter(r => warm.includes(r)).length >= regions.length * 0.5) return "tropical";
  if (regions.length <= 2 && scaleNames.size === 1) return "meditative";
  if (scaleNames.size >= 4) return "celestial";
  return "earthen";
}

// --- Lush algorithmic reverb impulse ---

function createReverb(ctx: BaseAudioContext, duration: number, brightness: number = 0.5): ConvolverNode {
  const convolver = ctx.createConvolver();
  const length = Math.ceil(ctx.sampleRate * duration);
  const impulse = ctx.createBuffer(2, length, ctx.sampleRate);

  for (let ch = 0; ch < 2; ch++) {
    const data = impulse.getChannelData(ch);
    for (let i = 0; i < length; i++) {
      const t = i / ctx.sampleRate;
      // Multi-stage decay: early reflections + late diffuse tail
      const early = t < 0.06 ? 0.4 * Math.exp(-t / 0.02) : 0;
      const mid = t < 0.3 ? 0.2 * Math.exp(-t / 0.12) : 0;
      const late = Math.exp(-2.2 * t / duration);
      // Darken over time (low-pass simulation)
      const darken = Math.exp(-t * (1 - brightness) * 3);
      const noise = Math.random() * 2 - 1;
      data[i] = noise * (early + mid + late) * darken * 0.35;
    }
  }
  convolver.buffer = impulse;
  return convolver;
}

// --- Smooth breath curve: organic volume swell ---

function breathCurve(t: number, dur: number): number {
  const x = t / dur;
  // Slow cosine rise and fall — like breathing
  return Math.sin(x * Math.PI) ** 0.6;
}

// --- Global intensity arc ---

function intensityAt(t: number, duration: number): number {
  const x = t / duration;
  if (x < 0.08) return x / 0.08 * 0.2;           // whisper intro
  if (x < 0.25) return 0.2 + (x - 0.08) / 0.17 * 0.35; // gentle build
  if (x < 0.55) return 0.55 + (x - 0.25) / 0.30 * 0.45; // bloom
  if (x < 0.75) return 1.0;                        // full presence
  if (x < 0.88) return 1.0 - (x - 0.75) / 0.13 * 0.3;  // recede
  return 0.7 - (x - 0.88) / 0.12 * 0.65;          // dissolve
}

// ============================================================
// COMPOSITION SCHEDULER — Organic, non-metric layers
// ============================================================

function scheduleComposition(
  ctx: BaseAudioContext,
  dest: AudioNode,
  regions: string[],
  startTime: number,
  duration: number
) {
  const atmosphere = detectAtmosphere(regions);
  const scale = buildMasterScale(regions);
  const seed = regions.reduce((s, r) => s + r.split("").reduce((a, c) => a + c.charCodeAt(0), 0), 42);
  const rng = mulberry32(seed);

  // --- Master bus: dry + reverb sends ---
  const masterGainNode = ctx.createGain();

  // Long lush reverb
  const reverbBright = atmosphere === "arctic" ? 0.3 :
    atmosphere === "oceanic" ? 0.4 :
    atmosphere === "tropical" ? 0.6 : 0.45;
  const reverbDur = atmosphere === "arctic" ? 8 : atmosphere === "oceanic" ? 7 : 5.5;
  const reverb = createReverb(ctx, reverbDur, reverbBright);
  const reverbSend = ctx.createGain();
  reverbSend.gain.value = 0.55;
  const dryGain = ctx.createGain();
  dryGain.gain.value = 0.45;

  // Second reverb for shimmer (brighter, longer)
  const shimmerReverb = createReverb(ctx, reverbDur + 3, reverbBright + 0.2);
  const shimmerSend = ctx.createGain();
  shimmerSend.gain.value = 0.35;

  masterGainNode.connect(dryGain);
  dryGain.connect(dest);
  masterGainNode.connect(reverb);
  reverb.connect(reverbSend);
  reverbSend.connect(dest);
  masterGainNode.connect(shimmerReverb);
  shimmerReverb.connect(shimmerSend);
  shimmerSend.connect(dest);

  // Master fade
  masterGainNode.gain.setValueAtTime(0, startTime);
  masterGainNode.gain.linearRampToValueAtTime(0.75, startTime + 6);
  masterGainNode.gain.setValueAtTime(0.75, startTime + duration - 8);
  masterGainNode.gain.linearRampToValueAtTime(0, startTime + duration);

  // Schedule all organic layers
  scheduleDrone(ctx, masterGainNode, scale, startTime, duration, rng, atmosphere);
  scheduleSubBreath(ctx, masterGainNode, scale, startTime, duration, rng, atmosphere);
  scheduleGranularTexture(ctx, masterGainNode, scale, startTime, duration, rng, atmosphere);
  scheduleCrystalFragments(ctx, masterGainNode, scale, startTime, duration, rng, atmosphere);
  scheduleBinauralLayer(ctx, masterGainNode, scale, startTime, duration, rng, atmosphere);
  scheduleHarmonicGhosts(ctx, masterGainNode, scale, startTime, duration, rng, atmosphere);
}

// ============================================================
// LAYER 1: DEEP DRONE — Slowly evolving harmonic bed
// Long overlapping tones with detuning, filter movement, LFOs
// ============================================================

function scheduleDrone(
  ctx: BaseAudioContext, dest: AudioNode,
  scale: number[], startTime: number, duration: number,
  rng: () => number, atmo: Atmosphere
) {
  // Pick 2-3 fundamental frequencies as drone roots
  const numRoots = 2 + (scale.length > 5 ? 1 : 0);
  const roots: number[] = [];
  for (let i = 0; i < numRoots; i++) {
    roots.push(scale[Math.floor(rng() * Math.min(3, scale.length))]);
  }

  // Each drone voice: ~15-25 seconds, overlapping by 8-12s
  const voiceDur = 16 + rng() * 10;
  const overlap = 8 + rng() * 4;
  const step = voiceDur - overlap;

  for (let t = 0; t < duration - 4; t += step) {
    const time = startTime + t;
    const thisDur = Math.min(voiceDur, duration - t);
    const intensity = intensityAt(t + thisDur / 2, duration);
    const rootFreq = roots[Math.floor(rng() * roots.length)];

    // Each voice = fundamental + 5th + octave, each detuned pair for width
    const partials = [
      rootFreq / 2,                    // sub
      rootFreq,                        // root
      rootFreq * 1.498,               // ~perfect 5th (slightly detuned for warmth)
      rootFreq * 2.003,               // octave (slightly sharp)
    ];

    for (let p = 0; p < partials.length; p++) {
      const freq = partials[p];
      const isLow = p < 2;
      const vol = isLow
        ? 0.045 * intensity * (0.8 + rng() * 0.4)
        : 0.025 * intensity * (0.6 + rng() * 0.4);

      // Detuned pair for stereo width
      for (const side of [-1, 1]) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();
        const panner = ctx.createStereoPanner();

        osc.type = isLow ? "sine" : "triangle";
        osc.frequency.value = freq;
        osc.detune.value = side * (3 + rng() * 5); // subtle stereo spread

        // Very slow frequency drift (Endel-like organic movement)
        const driftAmount = 2 + rng() * 4;
        const driftRate = 0.03 + rng() * 0.08;
        const driftLFO = ctx.createOscillator();
        const driftGain = ctx.createGain();
        driftLFO.type = "sine";
        driftLFO.frequency.value = driftRate;
        driftGain.gain.value = driftAmount;
        driftLFO.connect(driftGain);
        driftGain.connect(osc.detune);
        driftLFO.start(time);
        driftLFO.stop(time + thisDur + 0.5);

        // Slow filter sweep
        filter.type = "lowpass";
        const filterBase = isLow ? 300 : 600;
        const filterRange = isLow ? 400 : 1200;
        filter.frequency.setValueAtTime(filterBase + intensity * filterRange * 0.3, time);
        filter.frequency.linearRampToValueAtTime(
          filterBase + intensity * filterRange,
          time + thisDur * (0.4 + rng() * 0.2)
        );
        filter.frequency.linearRampToValueAtTime(
          filterBase + intensity * filterRange * 0.2,
          time + thisDur
        );
        filter.Q.value = 0.5 + rng() * 0.5;

        panner.pan.value = side * (0.15 + rng() * 0.25);

        // Breath-like envelope
        const attack = 3 + rng() * 3;
        const release = 4 + rng() * 3;
        gain.gain.setValueAtTime(0, time);
        gain.gain.linearRampToValueAtTime(vol, time + attack);
        gain.gain.setValueAtTime(vol, time + thisDur - release);
        gain.gain.linearRampToValueAtTime(0, time + thisDur);

        // Slow amplitude modulation (breathing)
        const ampLFO = ctx.createOscillator();
        const ampLFOGain = ctx.createGain();
        ampLFO.type = "sine";
        ampLFO.frequency.value = 0.06 + rng() * 0.12;
        ampLFOGain.gain.value = vol * 0.3;
        ampLFO.connect(ampLFOGain);
        ampLFOGain.connect(gain.gain);
        ampLFO.start(time);
        ampLFO.stop(time + thisDur + 0.5);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(panner);
        panner.connect(dest);
        osc.start(time);
        osc.stop(time + thisDur + 1);
      }
    }
  }
}

// ============================================================
// LAYER 2: SUB-BREATH — Deep sub-bass that pulses slowly
// ============================================================

function scheduleSubBreath(
  ctx: BaseAudioContext, dest: AudioNode,
  scale: number[], startTime: number, duration: number,
  rng: () => number, atmo: Atmosphere
) {
  const subFreq = scale[0] / 2; // Very low
  const breathCycleDur = 10 + rng() * 8; // 10-18 second breath cycles
  let t = 3; // Start after 3 seconds

  while (t < duration - 5) {
    const time = startTime + t;
    const cycleDur = breathCycleDur + (rng() - 0.5) * 4;
    const actualDur = Math.min(cycleDur, duration - t - 2);
    const intensity = intensityAt(t + actualDur / 2, duration);

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = "sine";
    osc.frequency.value = subFreq + (rng() - 0.5) * 2;

    // Slow pitch drift
    osc.frequency.linearRampToValueAtTime(
      subFreq + (rng() - 0.5) * 5,
      time + actualDur
    );

    filter.type = "lowpass";
    filter.frequency.value = 120 + intensity * 80;
    filter.Q.value = 1.2;

    const vol = 0.06 * intensity;
    // Organic breath envelope
    const attack = actualDur * (0.3 + rng() * 0.15);
    const release = actualDur * (0.35 + rng() * 0.15);
    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(vol, time + attack);
    gain.gain.setValueAtTime(vol * (0.7 + rng() * 0.3), time + actualDur - release);
    gain.gain.linearRampToValueAtTime(0, time + actualDur);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(dest);
    osc.start(time);
    osc.stop(time + actualDur + 0.5);

    // Add a very quiet second harmonic
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "sine";
    osc2.frequency.value = subFreq * 2;
    gain2.gain.setValueAtTime(0, time);
    gain2.gain.linearRampToValueAtTime(vol * 0.12, time + attack);
    gain2.gain.linearRampToValueAtTime(0, time + actualDur);
    osc2.connect(gain2);
    gain2.connect(dest);
    osc2.start(time);
    osc2.stop(time + actualDur + 0.5);

    t += cycleDur * (0.6 + rng() * 0.3); // Overlap between breath cycles
  }
}

// ============================================================
// LAYER 3: GRANULAR TEXTURE — Cloud of micro-grains
// Simulates granular synthesis with many tiny overlapping
// sine/triangle grains, creating a shimmering fog
// ============================================================

function scheduleGranularTexture(
  ctx: BaseAudioContext, dest: AudioNode,
  scale: number[], startTime: number, duration: number,
  rng: () => number, atmo: Atmosphere
) {
  // Grain parameters vary by atmosphere
  const grainDensity = atmo === "arctic" ? 0.8 : atmo === "tropical" ? 2.5 : atmo === "oceanic" ? 1.2 : 1.6;
  const grainDurBase = atmo === "arctic" ? 0.4 : atmo === "tropical" ? 0.15 : 0.25;

  // Higher octave scale for texture
  const textureScale = [
    ...scale.map(f => f * 2),
    ...scale.map(f => f * 4),
  ];

  let t = 6; // Start after 6 seconds

  while (t < duration - 3) {
    const intensity = intensityAt(t, duration);
    if (intensity < 0.15) { t += 0.5; continue; }

    // Variable density based on intensity
    const grainsPerSecond = grainDensity * intensity * (0.5 + rng() * 1.0);
    const grainSpacing = 1 / Math.max(0.5, grainsPerSecond);

    const grainDur = grainDurBase + rng() * 0.3;
    const time = startTime + t;
    const freq = textureScale[Math.floor(rng() * textureScale.length)];
    const pan = (rng() - 0.5) * 1.6; // Wide stereo field

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const panner = ctx.createStereoPanner();

    osc.type = rng() < 0.6 ? "sine" : "triangle";
    osc.frequency.value = freq * (0.98 + rng() * 0.04); // Micro-detuning
    osc.detune.value = (rng() - 0.5) * 20;

    panner.pan.value = Math.max(-1, Math.min(1, pan));

    // Grain envelope: quick fade in, quick fade out
    const vol = 0.015 * intensity * (0.4 + rng() * 0.6);
    const attack = grainDur * 0.2;
    const release = grainDur * 0.5;
    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(vol, time + attack);
    gain.gain.setValueAtTime(vol * 0.8, time + grainDur - release);
    gain.gain.linearRampToValueAtTime(0, time + grainDur);

    osc.connect(gain);
    gain.connect(panner);
    panner.connect(dest);
    osc.start(time);
    osc.stop(time + grainDur + 0.05);

    t += grainSpacing + rng() * grainSpacing * 0.5;
  }
}

// ============================================================
// LAYER 4: CRYSTAL FRAGMENTS — Sparse melodic moments
// Like Endel's occasional bell/piano-like tones: infrequent,
// reverb-drenched, with long decay. Lots of silence between.
// ============================================================

function scheduleCrystalFragments(
  ctx: BaseAudioContext, dest: AudioNode,
  scale: number[], startTime: number, duration: number,
  rng: () => number, atmo: Atmosphere
) {
  // Extended scale for range
  const fragScale = [
    ...scale,
    ...scale.map(f => f * 2),
    ...scale.map(f => f * 3), // Higher harmonics for sparkle
  ];

  // Fragment timing: very sparse, organic spacing
  const minGap = atmo === "meditative" ? 5 : atmo === "arctic" ? 7 : 3.5;
  const maxGap = atmo === "meditative" ? 12 : atmo === "arctic" ? 15 : 9;
  let t = 10 + rng() * 5; // Start late

  while (t < duration - 6) {
    const intensity = intensityAt(t, duration);
    if (intensity < 0.2) { t += minGap; continue; }

    const time = startTime + t;

    // Sometimes a single tone, sometimes a soft cluster of 2-3
    const clusterSize = rng() < 0.6 ? 1 : (rng() < 0.7 ? 2 : 3);
    const arpDelay = 0.08 + rng() * 0.15; // Gentle arpeggio spread

    for (let n = 0; n < clusterSize; n++) {
      const noteTime = time + n * arpDelay;
      const freq = fragScale[Math.floor(rng() * fragScale.length)];
      const pan = (rng() - 0.5) * 1.2;

      // Main tone
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();
      const panner = ctx.createStereoPanner();

      osc.type = "sine";
      osc.frequency.value = freq;

      // Bell-like: very fast attack, long exponential decay
      filter.type = "lowpass";
      filter.frequency.value = 2000 + intensity * 3000;
      filter.Q.value = 0.3;

      const vol = (0.04 + intensity * 0.04) * (0.6 + rng() * 0.4);
      const decayTime = 1.5 + rng() * 3.0;

      gain.gain.setValueAtTime(0, noteTime);
      gain.gain.linearRampToValueAtTime(vol, noteTime + 0.005);
      gain.gain.exponentialRampToValueAtTime(vol * 0.3, noteTime + decayTime * 0.4);
      gain.gain.exponentialRampToValueAtTime(0.0005, noteTime + decayTime);

      // Slight pitch drift downward (like a real bell)
      osc.frequency.setValueAtTime(freq * 1.002, noteTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.998, noteTime + decayTime);

      panner.pan.value = Math.max(-1, Math.min(1, pan));

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(panner);
      panner.connect(dest);
      osc.start(noteTime);
      osc.stop(noteTime + decayTime + 0.5);

      // Add inharmonic partial for bell character
      if (rng() < 0.65) {
        const partial = ctx.createOscillator();
        const pGain = ctx.createGain();
        partial.type = "sine";
        // Inharmonic ratios: 2.76, 5.4, 3.1 — bell-like
        const ratio = [2.76, 5.4, 3.1, 1.51][Math.floor(rng() * 4)];
        partial.frequency.value = freq * ratio;
        const pVol = vol * (0.06 + rng() * 0.08);
        pGain.gain.setValueAtTime(0, noteTime);
        pGain.gain.linearRampToValueAtTime(pVol, noteTime + 0.003);
        pGain.gain.exponentialRampToValueAtTime(0.0005, noteTime + decayTime * 0.3);
        partial.connect(pGain);
        pGain.connect(panner);
        partial.start(noteTime);
        partial.stop(noteTime + decayTime * 0.4);
      }
    }

    // Next fragment: organic spacing with jitter
    t += minGap + rng() * (maxGap - minGap);
  }
}

// ============================================================
// LAYER 5: BINAURAL LAYER — Subtle frequency beating
// Slightly different frequencies in L and R channels create
// a gentle binaural effect, adding depth and immersion
// ============================================================

function scheduleBinauralLayer(
  ctx: BaseAudioContext, dest: AudioNode,
  scale: number[], startTime: number, duration: number,
  rng: () => number, atmo: Atmosphere
) {
  // Pick 1-2 low frequencies for binaural drones
  const binauralFreqs = [scale[0] / 2, scale[Math.min(2, scale.length - 1)] / 2];
  const beatFreq = atmo === "meditative" ? 2 :
    atmo === "arctic" ? 1.5 :
    atmo === "oceanic" ? 3 : 2.5; // Hz difference between ears

  const voiceDur = 20 + rng() * 15;
  const overlap = 10 + rng() * 5;
  let t = 2;

  while (t < duration - 5) {
    const time = startTime + t;
    const thisDur = Math.min(voiceDur, duration - t - 2);
    const intensity = intensityAt(t + thisDur / 2, duration);
    const freq = binauralFreqs[Math.floor(rng() * binauralFreqs.length)];
    const thisbeat = beatFreq + (rng() - 0.5) * 1;

    // Left ear
    const oscL = ctx.createOscillator();
    const gainL = ctx.createGain();
    const panL = ctx.createStereoPanner();
    oscL.type = "sine";
    oscL.frequency.value = freq;
    panL.pan.value = -0.95;

    // Right ear — slightly different frequency
    const oscR = ctx.createOscillator();
    const gainR = ctx.createGain();
    const panR = ctx.createStereoPanner();
    oscR.type = "sine";
    oscR.frequency.value = freq + thisbeat;
    panR.pan.value = 0.95;

    const vol = 0.02 * intensity * (0.6 + rng() * 0.4);
    const attack = 5 + rng() * 3;
    const release = 5 + rng() * 4;

    for (const [gain, osc, pan] of [[gainL, oscL, panL], [gainR, oscR, panR]] as [GainNode, OscillatorNode, StereoPannerNode][]) {
      gain.gain.setValueAtTime(0, time);
      gain.gain.linearRampToValueAtTime(vol, time + attack);
      gain.gain.setValueAtTime(vol, time + thisDur - release);
      gain.gain.linearRampToValueAtTime(0, time + thisDur);
      osc.connect(gain);
      gain.connect(pan);
      pan.connect(dest);
      osc.start(time);
      osc.stop(time + thisDur + 1);
    }

    t += voiceDur - overlap + rng() * 5;
  }
}

// ============================================================
// LAYER 6: HARMONIC GHOSTS — Ethereal upper partials
// Very quiet high-frequency tones that drift in and out,
// adding air and shimmer like distant wind chimes
// ============================================================

function scheduleHarmonicGhosts(
  ctx: BaseAudioContext, dest: AudioNode,
  scale: number[], startTime: number, duration: number,
  rng: () => number, atmo: Atmosphere
) {
  // Very high frequencies for ethereal quality
  const ghostScale = scale.map(f => f * 4).concat(scale.map(f => f * 6));

  const density = atmo === "celestial" ? 1.2 : atmo === "arctic" ? 0.5 : 0.8;
  let t = 15 + rng() * 10;

  while (t < duration - 4) {
    const intensity = intensityAt(t, duration);
    if (intensity < 0.3) { t += 3 + rng() * 3; continue; }

    const time = startTime + t;
    const freq = ghostScale[Math.floor(rng() * ghostScale.length)];
    const toneDur = 2 + rng() * 5;
    const pan = (rng() - 0.5) * 1.8;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    const panner = ctx.createStereoPanner();

    osc.type = "sine";
    osc.frequency.value = freq * (0.99 + rng() * 0.02);

    // Slow drift
    osc.frequency.linearRampToValueAtTime(
      freq * (0.995 + rng() * 0.01),
      time + toneDur
    );

    filter.type = "bandpass";
    filter.frequency.value = freq;
    filter.Q.value = 2 + rng() * 3;

    const vol = 0.008 * intensity * (0.3 + rng() * 0.7);
    const attack = toneDur * (0.2 + rng() * 0.3);
    const release = toneDur * (0.3 + rng() * 0.3);

    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(vol, time + attack);
    gain.gain.setValueAtTime(vol * (0.5 + rng() * 0.5), time + toneDur - release);
    gain.gain.linearRampToValueAtTime(0, time + toneDur);

    panner.pan.value = Math.max(-1, Math.min(1, pan));

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(panner);
    panner.connect(dest);
    osc.start(time);
    osc.stop(time + toneDur + 1);

    t += (1 / density) * (2 + rng() * 4);
  }
}

// --- Post-render normalization ---

function normalizeBuffer(buffer: AudioBuffer, targetPeak: number = 0.92): void {
  let peak = 0;
  for (let ch = 0; ch < buffer.numberOfChannels; ch++) {
    const data = buffer.getChannelData(ch);
    for (let i = 0; i < data.length; i++) {
      const abs = Math.abs(data[i]);
      if (abs > peak) peak = abs;
    }
  }
  if (peak < 0.001) return;
  const gain = targetPeak / peak;
  for (let ch = 0; ch < buffer.numberOfChannels; ch++) {
    const data = buffer.getChannelData(ch);
    for (let i = 0; i < data.length; i++) {
      data[i] *= gain;
    }
  }
}

// --- WAV encoder ---
function encodeWAV(buffer: AudioBuffer): Blob {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const format = 1;
  const bitDepth = 16;
  const length = buffer.length * numChannels * (bitDepth / 8);
  const headerLength = 44;
  const arrayBuffer = new ArrayBuffer(headerLength + length);
  const view = new DataView(arrayBuffer);

  function writeString(offset: number, str: string) {
    for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
  }

  writeString(0, "RIFF");
  view.setUint32(4, 36 + length, true);
  writeString(8, "WAVE");
  writeString(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, format, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * numChannels * (bitDepth / 8), true);
  view.setUint16(32, numChannels * (bitDepth / 8), true);
  view.setUint16(34, bitDepth, true);
  writeString(36, "data");
  view.setUint32(40, length, true);

  const channels: Float32Array[] = [];
  for (let ch = 0; ch < numChannels; ch++) {
    channels.push(buffer.getChannelData(ch));
  }

  let offset = 44;
  for (let i = 0; i < buffer.length; i++) {
    for (let ch = 0; ch < numChannels; ch++) {
      const sample = Math.max(-1, Math.min(1, channels[ch][i]));
      view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
      offset += 2;
    }
  }

  return new Blob([arrayBuffer], { type: "audio/wav" });
}

// ============================================================
// Main AudioEngine class (public API unchanged)
// ============================================================

export class AudioEngine {
  private ctx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private masterGain: GainNode | null = null;
  private sourceNode: AudioBufferSourceNode | null = null;
  private renderedBuffer: AudioBuffer | null = null;
  private playbackStartTime: number = 0;
  private playbackOffset: number = 0;
  private _isPlaying: boolean = false;
  private _isPaused: boolean = false;
  private _sourceGen: number = 0;
  readonly duration: number = 80;

  ensureCtx() {
    if (!this.ctx) {
      this.ctx = new AudioContext();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 1;
      const compressor = this.ctx.createDynamicsCompressor();
      compressor.threshold.value = -24;
      compressor.knee.value = 30;
      compressor.ratio.value = 4;
      compressor.attack.value = 0.003;
      compressor.release.value = 0.25;
      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 256;
      this.analyser.smoothingTimeConstant = 0.75;
      this.masterGain.connect(compressor);
      compressor.connect(this.analyser);
      this.analyser.connect(this.ctx.destination);
    }
    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  getAnalyser(): AnalyserNode | null {
    return this.analyser;
  }

  getProgress(): number {
    if (this._isPaused) return Math.min(this.playbackOffset / this.duration, 1);
    if (!this._isPlaying || !this.ctx) return 0;
    const elapsed = this.playbackOffset + (this.ctx.currentTime - this.playbackStartTime);
    return Math.min(elapsed / this.duration, 1);
  }

  getCurrentTime(): number {
    if (this._isPaused) return this.playbackOffset;
    if (!this._isPlaying || !this.ctx) return 0;
    return Math.min(this.playbackOffset + (this.ctx.currentTime - this.playbackStartTime), this.duration);
  }

  getIsPlaying(): boolean { return this._isPlaying; }
  getIsPaused(): boolean { return this._isPaused; }
  hasBuffer(): boolean { return this.renderedBuffer !== null; }

  setVolume(value: number, rampTime: number = 0) {
    this.ensureCtx();
    if (!this.masterGain || !this.ctx) return;
    const v = Math.max(0, Math.min(1, value));
    if (rampTime > 0) {
      this.masterGain.gain.cancelScheduledValues(this.ctx.currentTime);
      this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, this.ctx.currentTime);
      this.masterGain.gain.linearRampToValueAtTime(v, this.ctx.currentTime + rampTime);
    } else {
      this.masterGain.gain.setValueAtTime(v, this.ctx.currentTime);
    }
  }

  playPinTone(musicalRegion: string) {
    this.ensureCtx();
    const ctx = this.ctx!;
    const scale = getScaleForRegion(musicalRegion);
    const now = ctx.currentTime;

    // Endel-style pin tone: soft resonant chime with long tail
    const toneGain = ctx.createGain();
    toneGain.gain.value = 0.4;
    toneGain.connect(ctx.destination);

    const rootFreq = scale[Math.floor(Math.random() * Math.min(3, scale.length))];
    const tones = [rootFreq, rootFreq * 1.5, rootFreq * 2];

    for (let i = 0; i < tones.length; i++) {
      const freq = tones[i];
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();
      const panner = ctx.createStereoPanner();

      osc.type = "sine";
      osc.frequency.value = freq;
      osc.detune.value = (Math.random() - 0.5) * 8;

      filter.type = "lowpass";
      filter.frequency.setValueAtTime(3000, now);
      filter.frequency.exponentialRampToValueAtTime(400, now + 3);
      filter.Q.value = 0.5;

      panner.pan.value = (i - 1) * 0.3;

      const vol = i === 0 ? 0.12 : 0.05;
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(vol, now + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 3.5);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(panner);
      panner.connect(toneGain);
      osc.start(now);
      osc.stop(now + 4);
    }
  }

  async renderComposition(regions: string[]): Promise<void> {
    const sampleRate = 44100;
    const offline = new OfflineAudioContext(2, sampleRate * this.duration, sampleRate);
    const compressor = offline.createDynamicsCompressor();
    compressor.threshold.value = -24;
    compressor.knee.value = 30;
    compressor.ratio.value = 4;
    compressor.attack.value = 0.003;
    compressor.release.value = 0.25;
    compressor.connect(offline.destination);
    scheduleComposition(offline, compressor, regions, 0, this.duration);
    this.renderedBuffer = await offline.startRendering();
    normalizeBuffer(this.renderedBuffer);
    this.ensureCtx();
  }

  play(offset: number = 0) {
    this.ensureCtx();
    this.stopSource();
    if (!this.renderedBuffer || !this.ctx || !this.analyser) return;

    const gen = this._sourceGen;
    const source = this.ctx.createBufferSource();
    source.buffer = this.renderedBuffer;
    source.connect(this.masterGain!);
    source.start(0, offset);
    source.onended = () => {
      if (this._sourceGen === gen) {
        this._isPlaying = false;
        this._isPaused = false;
        this.playbackOffset = this.duration;
      }
    };

    this.sourceNode = source;
    this.playbackStartTime = this.ctx.currentTime;
    this.playbackOffset = offset;
    this._isPlaying = true;
    this._isPaused = false;
  }

  seek(time: number) {
    const t = Math.max(0, Math.min(time, this.duration - 0.1));
    this.play(t);
  }

  pause() {
    if (this._isPaused) return;
    if (!this._isPlaying) return;
    const current = this.getCurrentTime();
    this.stopSource();
    this.playbackOffset = current;
    this._isPaused = true;
    this._isPlaying = true;
  }

  resume() {
    if (!this._isPaused) return;
    this.play(this.playbackOffset);
  }

  togglePause() {
    if (this._isPaused) {
      this.resume();
    } else if (this._isPlaying) {
      this.pause();
    } else if (this.renderedBuffer) {
      this.play(0);
    }
  }

  stop() {
    this.stopSource();
    this._isPlaying = false;
    this._isPaused = false;
    this.playbackOffset = 0;
  }

  private stopSource() {
    this._sourceGen++;
    if (this.sourceNode) {
      try { this.sourceNode.stop(); } catch {}
      try { this.sourceNode.disconnect(); } catch {}
      this.sourceNode = null;
    }
  }

  exportWAV(): Blob | null {
    if (!this.renderedBuffer) return null;
    return encodeWAV(this.renderedBuffer);
  }

  downloadWAV(filename: string = "meridian-composition.wav") {
    const blob = this.exportWAV();
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  dispose() {
    this.stop();
    this.ctx?.close();
    this.ctx = null;
    this.analyser = null;
    this.renderedBuffer = null;
  }
}

// --- Public helper used by Tracklist.tsx ---

export function getRegionLabel(musicalRegion: string): string {
  return REGION_SCALE_MAP[musicalRegion] || "Major";
}
