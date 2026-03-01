import type { GlobePin } from "./Globe";

/**
 * Generates a short 5–6 line cinematic micro-story
 * that interprets the user's pin journey poetically.
 * Deterministic per pin set (seeded random).
 */

// ── helpers ──────────────────────────────────────────

function seededRandom(seed: string): () => number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (Math.imul(31, h) + seed.charCodeAt(i)) | 0;
  }
  return () => {
    h = Math.imul(h ^ (h >>> 16), 0x45d9f3b);
    h = Math.imul(h ^ (h >>> 13), 0x45d9f3b);
    h = (h ^ (h >>> 16)) >>> 0;
    return h / 4294967296;
  };
}

function pick<T>(arr: T[], rand: () => number): T {
  return arr[Math.floor(rand() * arr.length)];
}

function getContinent(region: string): string {
  const r = region.toLowerCase();
  if (r.includes("africa")) return "Africa";
  if (r.includes("europe")) return "Europe";
  if (r.includes("north america") || r.includes("central america")) return "North America";
  if (r.includes("south america")) return "South America";
  if (r.includes("asia") || r.includes("middle east")) return "Asia";
  if (r.includes("oceania")) return "Oceania";
  return "the unknown";
}

function compassDirection(fromLng: number, fromLat: number, toLng: number, toLat: number): string {
  const dLng = toLng - fromLng;
  const dLat = toLat - fromLat;
  if (Math.abs(dLat) > Math.abs(dLng)) {
    return dLat > 0 ? "north" : "south";
  }
  return dLng > 0 ? "east" : "west";
}

function latitudeWord(lat: number): string {
  if (lat > 55) return "arctic";
  if (lat > 35) return "temperate";
  if (lat > 15) return "subtropical";
  if (lat > -15) return "equatorial";
  if (lat > -35) return "subtropical";
  return "southern";
}

// ── line templates ──────────────────────────────────

// Opening lines — set the scene
const OPENINGS = [
  (p: GlobePin) => `It began in ${p.city || p.country}, as most things do — quietly.`,
  (p: GlobePin) => `Someone placed a finger on ${p.city || p.country} and the map began to hum.`,
  (p: GlobePin) => `The first sound came from ${p.city || p.country}. It was almost a question.`,
  (p: GlobePin) => `In ${p.city || p.country}, a frequency was waiting to be found.`,
  (p: GlobePin) => `A point of light appeared over ${p.city || p.country}. Then another.`,
  (p: GlobePin) => `${p.city || p.country} offered the first note — the rest followed.`,
];

// Journey / middle lines — describe the movement
const JOURNEY_LINES = [
  (from: GlobePin, to: GlobePin) =>
    `The signal drifted ${compassDirection(from.lng, from.lat, to.lng, to.lat)} toward ${to.city || to.country}.`,
  (from: GlobePin, to: GlobePin) =>
    `From ${from.city || from.country} to ${to.city || to.country} — the distance became a melody.`,
  (_from: GlobePin, to: GlobePin) =>
    `Something shifted near ${to.city || to.country}. A new overtone.`,
  (_from: GlobePin, to: GlobePin) =>
    `By the time it reached ${to.city || to.country}, the sound had changed.`,
  (from: GlobePin, to: GlobePin) =>
    `${from.city || from.country} handed a rhythm to ${to.city || to.country}, wordlessly.`,
  (_from: GlobePin, to: GlobePin) =>
    `The air above ${to.city || to.country} carried a different weight.`,
];

// Spread / scope lines — describe the geographic breadth
const SPREAD_LINES = [
  (continents: string[]) =>
    `The thread now stretched across ${continents.join(" and ")} — thin, but unbroken.`,
  (continents: string[]) =>
    `${continents.length} continents, each holding a different silence.`,
  (_continents: string[]) =>
    `The melody crossed time zones, collecting dust and light.`,
  (_continents: string[]) =>
    `Every border it crossed left a mark on the frequency.`,
  (continents: string[]) =>
    `From ${continents[0]} to ${continents[continents.length - 1]}, the Earth turned beneath the sound.`,
];

// Atmospheric / texture lines
const TEXTURE_LINES = [
  (pin: GlobePin) => `The ${latitudeWord(pin.lat)} air near ${pin.city || pin.country} bent the harmonics.`,
  (_pin: GlobePin) => `Somewhere between the notes, a kind of longing appeared.`,
  (_pin: GlobePin) => `The spaces between the pins were not empty — they were the composition.`,
  (pin: GlobePin) => `Near ${pin.city || pin.country}, the tone softened into something like memory.`,
  (_pin: GlobePin) => `Not every frequency needs to be heard to be felt.`,
  (_pin: GlobePin) => `The globe spun slowly. The music did not stop.`,
];

// Closing lines — before title reveal
const CLOSINGS = [
  (count: number) => `${count} points of light. One unbroken sound.`,
  (_count: number) => `And then — from all those distances — a single composition.`,
  (count: number) => `${count} places. One frequency. This is what it sounds like.`,
  (_count: number) => `The map went quiet. The music did not.`,
  (_count: number) => `What remains is not a route, but a resonance.`,
  (_count: number) => `And from all those coordinates — this.`,
];

// ── main generator ──────────────────────────────────

export function generateStory(pins: GlobePin[]): string[] {
  if (pins.length === 0) return ["Place your marks upon the world."];

  const seed = pins.map((p) => `${p.city}|${p.country}|${p.lng.toFixed(2)}`).join("~");
  const rand = seededRandom(seed);

  const first = pins[0];
  const last = pins[pins.length - 1];
  const mid = pins[Math.floor(pins.length / 2)];
  const continents = [...new Set(pins.map((p) => getContinent(p.musicalRegion)))];

  const lines: string[] = [];

  // 1. Opening
  lines.push(pick(OPENINGS, rand)(first));

  // 2. Journey line (first → mid)
  if (pins.length > 2) {
    lines.push(pick(JOURNEY_LINES, rand)(first, mid));
  } else {
    lines.push(pick(JOURNEY_LINES, rand)(first, last));
  }

  // 3. Spread / texture
  if (continents.length >= 2) {
    lines.push(pick(SPREAD_LINES, rand)(continents));
  } else {
    lines.push(pick(TEXTURE_LINES, rand)(mid));
  }

  // 4. Atmospheric texture line
  const texturePick = pins.length > 3 ? pick(TEXTURE_LINES, rand)(last) : pick(TEXTURE_LINES, rand)(mid);
  // Avoid duplicating the previous line
  if (texturePick !== lines[lines.length - 1]) {
    lines.push(texturePick);
  } else {
    lines.push(pick(TEXTURE_LINES, rand)(first));
  }

  // 5. Journey line to final destination (if enough pins)
  if (pins.length > 3) {
    lines.push(pick(JOURNEY_LINES, rand)(mid, last));
  }

  // 6. Closing
  lines.push(pick(CLOSINGS, rand)(pins.length));

  return lines.slice(0, 6);
}
