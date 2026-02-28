import type { GlobePin } from "./Globe";

// --- Poetic album title generator based on selected regions/cities ---

interface AlbumMeta {
  title: string;
  subtitle: string;
  epigraph: string; // a one-line poetic description
}

// Continent groupings for analysis
function getContinents(pins: GlobePin[]): Set<string> {
  const set = new Set<string>();
  for (const p of pins) {
    const r = p.musicalRegion;
    if (r.includes("Africa")) set.add("Africa");
    else if (r.includes("Europe")) set.add("Europe");
    else if (r.includes("America")) set.add("Americas");
    else if (r.includes("Asia") || r === "Middle East") set.add("Asia");
    else if (r === "Oceania") set.add("Oceania");
  }
  return set;
}

function hasRegion(pins: GlobePin[], ...keywords: string[]): boolean {
  return pins.some((p) =>
    keywords.some((k) => p.musicalRegion.toLowerCase().includes(k.toLowerCase()))
  );
}

// Title fragments
const ADJECTIVES = [
  "Distant", "Fading", "Golden", "Silent", "Borrowed",
  "Unwritten", "Floating", "Woven", "Hollow", "Tidal",
  "Sunken", "Veiled", "Midnight", "Burning", "Drifting",
];

const NOUNS = [
  "Letters", "Frequencies", "Meridians", "Passages", "Echoes",
  "Tides", "Routes", "Maps", "Signals", "Horizons",
  "Crossings", "Currents", "Longitudes", "Fragments", "Coastlines",
];

const PREPOSITIONS = [
  "from", "across", "between", "along", "beyond", "through",
];

// Thematic title pools based on region combos
const THEMED_TITLES: { test: (pins: GlobePin[]) => boolean; titles: string[] }[] = [
  {
    test: (pins) => hasRegion(pins, "east asia") && hasRegion(pins, "europe"),
    titles: [
      "Silk & Static",
      "Letters Along the Silk Road",
      "Between the Pagoda and the Steeple",
      "East of Midnight",
    ],
  },
  {
    test: (pins) => hasRegion(pins, "south asia") && hasRegion(pins, "middle east"),
    titles: [
      "Silk & Saffron",
      "Incense Routes",
      "The Caravan Tapes",
      "Dust and Devotion",
    ],
  },
  {
    test: (pins) => hasRegion(pins, "africa") && hasRegion(pins, "america"),
    titles: [
      "The Atlantic Crossing",
      "Rhythms Carried by Water",
      "Songs the Ocean Remembers",
      "Salt and Rhythm",
    ],
  },
  {
    test: (pins) => hasRegion(pins, "north") && hasRegion(pins, "oceania"),
    titles: [
      "The Long Meridian",
      "Pole to Reef",
      "Aurora to Coral",
      "From Ice to Tide",
    ],
  },
  {
    test: (pins) => hasRegion(pins, "south america") && hasRegion(pins, "southern europe"),
    titles: [
      "The Iberian Drift",
      "Fado and Bossa",
      "Latin Vespers",
      "Old World, New Rhythm",
    ],
  },
  {
    test: (pins) => hasRegion(pins, "west africa") && hasRegion(pins, "east africa"),
    titles: [
      "Coast to Coast (Across the Sahel)",
      "The Sahel Sessions",
      "Drum Language",
      "Rhythms of the Rift",
    ],
  },
  {
    test: (pins) => hasRegion(pins, "northern europe") && hasRegion(pins, "east asia"),
    titles: [
      "Fjords and Frequencies",
      "Northern Silence, Eastern Light",
      "Between the Pines and the Pagoda",
    ],
  },
  {
    test: (pins) => hasRegion(pins, "central asia"),
    titles: [
      "Steppe Transmissions",
      "Songs from the Corridor",
      "The Inner Route",
    ],
  },
];

// Spread-based fallback titles
const SPREAD_TITLES: Record<string, string[]> = {
  "1": [
    "One Continent, Many Voices",
    "Variations on a Homeland",
    "Close Frequencies",
  ],
  "2": [
    "Two Hemispheres Talking",
    "A Conversation Across Borders",
    "Dual Meridians",
  ],
  "3": [
    "Triangulation",
    "Three Points of Longitude",
    "The Triadic Route",
  ],
  "4": [
    "Four Corners Singing",
    "Cardinal Frequencies",
    "Quaternity",
  ],
  "5": [
    "All the World's a Frequency",
    "Pangaea Revisited",
    "The Complete Meridian",
  ],
};

// Epigraphs
const EPIGRAPHS: string[] = [
  "Every place carries a tone only distance can hear.",
  "What if a map could sing itself to sleep?",
  "Eight points of light across the dark.",
  "The earth hums differently depending on where you listen.",
  "You pressed your ear to the globe and heard this.",
  "A composition drawn from longitude and longing.",
  "These frequencies were waiting for someone to connect them.",
  "Music is just geography in motion.",
  "The shortest distance between two places is a melody.",
  "Some routes are better heard than seen.",
];

function seededRandom(seed: string): () => number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(31, h) + seed.charCodeAt(i) | 0;
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

// Generate a subtitle from the pin cities
function generateSubtitle(pins: GlobePin[]): string {
  if (pins.length <= 3) {
    return pins.map((p) => p.city || p.country).join(" \u2014 ");
  }
  // Pick first, middle, and last for a journey feel
  const first = pins[0].city || pins[0].country;
  const mid = pins[Math.floor(pins.length / 2)].city || pins[Math.floor(pins.length / 2)].country;
  const last = pins[pins.length - 1].city || pins[pins.length - 1].country;
  return `${first} \u2014 ${mid} \u2014 ${last}`;
}

export function generateAlbumMeta(pins: GlobePin[]): AlbumMeta {
  // Build a seed from pin data for deterministic randomness
  const seed = pins.map((p) => `${p.city}${p.country}${p.musicalRegion}`).join("|");
  const rand = seededRandom(seed);

  const continents = getContinents(pins);
  const spread = Math.min(continents.size, 5);

  // Try themed titles first
  let title = "";
  for (const themed of THEMED_TITLES) {
    if (themed.test(pins)) {
      title = pick(themed.titles, rand);
      break;
    }
  }

  // Fallback: spread-based or procedural
  if (!title) {
    const spreadTitles = SPREAD_TITLES[String(spread)] || SPREAD_TITLES["3"];
    if (rand() < 0.5) {
      title = pick(spreadTitles, rand);
    } else {
      // Procedural: "Adjective Noun" or "Noun preposition Place"
      if (rand() < 0.6) {
        title = `${pick(ADJECTIVES, rand)} ${pick(NOUNS, rand)}`;
      } else {
        const place = pins[Math.floor(rand() * pins.length)];
        const placeName = place.city || place.country;
        title = `${pick(NOUNS, rand)} ${pick(PREPOSITIONS, rand)} ${placeName}`;
      }
    }
  }

  return {
    title,
    subtitle: generateSubtitle(pins),
    epigraph: pick(EPIGRAPHS, rand),
  };
}
