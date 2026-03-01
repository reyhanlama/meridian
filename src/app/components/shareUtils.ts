import type { GlobePin } from "./Globe";

// URL schema: #pins=lng,lat,city,country,musicalRegion;lng,lat,...
// Separators chosen to avoid characters present in any city/country/region name.
const SEP_PIN = ";";
const SEP_FIELD = ",";

export function encodePins(pins: GlobePin[]): string {
  if (pins.length === 0) return "";
  return (
    "pins=" +
    pins
      .map((p) =>
        [p.lng.toFixed(2), p.lat.toFixed(2), p.city, p.country, p.musicalRegion].join(SEP_FIELD)
      )
      .join(SEP_PIN)
  );
}

export function decodePins(hash: string): Array<Omit<GlobePin, "id" | "color">> {
  try {
    const raw = hash.replace(/^#/, "");
    const match = raw.match(/(?:^|&)pins=([^&]*)/);
    if (!match || !match[1]) return [];
    return match[1]
      .split(SEP_PIN)
      .map((seg) => {
        const parts = seg.split(SEP_FIELD);
        if (parts.length < 5) return null;
        const [lngStr, latStr, city, country, musicalRegion] = parts;
        const lng = parseFloat(lngStr);
        const lat = parseFloat(latStr);
        if (isNaN(lng) || isNaN(lat)) return null;
        return { lng, lat, city, country, musicalRegion };
      })
      .filter((p): p is Omit<GlobePin, "id" | "color"> => p !== null);
  } catch {
    return [];
  }
}
