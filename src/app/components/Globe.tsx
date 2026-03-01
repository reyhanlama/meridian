import { useEffect, useRef, useState, useCallback } from "react";
import { COUNTRY_NAMES, getMusicalRegion, getWaterBodyName } from "./countryData";
import { CITIES } from "./cityData";

const PIN_COLORS = ["#ff6b35", "#4ecdc4", "#ffe66d", "#c77dff", "#f7c59f", "#56cfe1", "#e77377", "#80ed99"];
const MAX_CITY_DIST_RAD = 4.5 * (Math.PI / 180); // ~500 km — snaps to nearest major city
const DEG = Math.PI / 180;

export interface GlobePin {
  id: number;
  lng: number;
  lat: number;
  country: string;
  city: string;
  musicalRegion: string;
  color: string;
}

interface GlobeProps {
  pins: GlobePin[];
  maxPins: number;
  onPinDrop: (pin: GlobePin) => void;
  onPinRemove?: (pinId: number) => void;
}

// --- Orthographic projection ---
function project(
  lng: number, lat: number,
  cLng: number, cLat: number,
  R: number, cx: number, cy: number
): [number, number] | null {
  const λ = lng * DEG, φ = lat * DEG;
  const λ0 = cLng * DEG, φ0 = cLat * DEG;
  const cosC = Math.sin(φ0) * Math.sin(φ) + Math.cos(φ0) * Math.cos(φ) * Math.cos(λ - λ0);
  if (cosC < 0) return null; // behind globe
  const x = R * Math.cos(φ) * Math.sin(λ - λ0);
  const y = R * (Math.cos(φ0) * Math.sin(φ) - Math.sin(φ0) * Math.cos(φ) * Math.cos(λ - λ0));
  return [cx + x, cy - y];
}

function unproject(
  px: number, py: number,
  cLng: number, cLat: number,
  R: number, cx: number, cy: number
): [number, number] | null {
  const x = (px - cx) / R;
  const y = -(py - cy) / R;
  const ρ = Math.sqrt(x * x + y * y);
  if (ρ > 1) return null;
  const c = Math.asin(ρ);
  const φ0 = cLat * DEG;
  const λ0 = cLng * DEG;
  const sinC = Math.sin(c), cosC = Math.cos(c);
  const lat = Math.asin(cosC * Math.sin(φ0) + (y * sinC * Math.cos(φ0)) / (ρ || 1));
  const lng = λ0 + Math.atan2(x * sinC, ρ * Math.cos(φ0) * cosC - y * Math.sin(φ0) * sinC);
  return [lng / DEG, lat / DEG];
}

function geoDistanceDeg(lng1: number, lat1: number, lng2: number, lat2: number): number {
  const φ1 = lat1 * DEG, φ2 = lat2 * DEG;
  const Δλ = (lng2 - lng1) * DEG;
  return Math.acos(
    Math.min(1, Math.max(-1, Math.sin(φ1) * Math.sin(φ2) + Math.cos(φ1) * Math.cos(φ2) * Math.cos(Δλ)))
  );
}

function interpolateGreatCircle(
  p0: [number, number], p1: [number, number]
): (t: number) => [number, number] {
  const [λ0, φ0] = [p0[0] * DEG, p0[1] * DEG];
  const [λ1, φ1] = [p1[0] * DEG, p1[1] * DEG];
  const d = geoDistanceDeg(p0[0], p0[1], p1[0], p1[1]);
  if (d < 0.001) return () => p0;
  const sinD = Math.sin(d);
  return (t: number) => {
    const A = Math.sin((1 - t) * d) / sinD;
    const B = Math.sin(t * d) / sinD;
    const x = A * Math.cos(φ0) * Math.cos(λ0) + B * Math.cos(φ1) * Math.cos(λ1);
    const y = A * Math.cos(φ0) * Math.sin(λ0) + B * Math.cos(φ1) * Math.sin(λ1);
    const z = A * Math.sin(φ0) + B * Math.sin(φ1);
    return [Math.atan2(y, x) / DEG, Math.atan2(z, Math.sqrt(x * x + y * y)) / DEG];
  };
}

// --- Minimal TopoJSON decoder ---
interface TopoArc { arcs: number[][][]; transform: { scale: [number, number]; translate: [number, number] }; objects: any }

function decodeTopojson(topology: any): any {
  const tf = topology.transform;
  const decoded: [number, number][][] = topology.arcs.map((arc: number[][]) => {
    let x = 0, y = 0;
    return arc.map(([dx, dy]: number[]) => {
      x += dx; y += dy;
      return [
        x * tf.scale[0] + tf.translate[0],
        y * tf.scale[1] + tf.translate[1],
      ] as [number, number];
    });
  });

  function stitchArcs(indices: number[]): [number, number][] {
    const coords: [number, number][] = [];
    for (const i of indices) {
      const arc = i >= 0 ? decoded[i] : decoded[~i].slice().reverse();
      // Skip first point of arc if it duplicates the last point we added
      const start = coords.length > 0 ? 1 : 0;
      for (let j = start; j < arc.length; j++) {
        coords.push(arc[j]);
      }
    }
    return coords;
  }

  function decodeGeom(g: any): any {
    if (g.type === "Polygon") {
      return { type: "Polygon", coordinates: g.arcs.map((ring: number[]) => stitchArcs(ring)) };
    }
    if (g.type === "MultiPolygon") {
      return {
        type: "MultiPolygon",
        coordinates: g.arcs.map((poly: number[][]) => poly.map((ring: number[]) => stitchArcs(ring))),
      };
    }
    return null;
  }

  const geometries = topology.objects.countries?.geometries || [];
  return {
    type: "FeatureCollection",
    features: geometries.map((g: any) => ({
      type: "Feature",
      id: String(g.id),
      properties: g.properties || {},
      geometry: decodeGeom(g),
    })),
  };
}

// --- Geographic point-in-polygon (ray-casting in geo space) ---
function pointInPolygonGeo(lng: number, lat: number, ring: [number, number][]): boolean {
  if (ring.length < 3) return false;
  // Normalise relative to the ring's own first vertex, not the test point.
  // Normalising per-vertex relative to the test point causes opposite-hemisphere
  // polygons (e.g. Mexico when testing India) to wrap around and produce false hits.
  const refLng = ring[0][0];
  let testLng = lng;
  if (testLng - refLng > 180) testLng -= 360;
  else if (testLng - refLng < -180) testLng += 360;

  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    let xi = ring[i][0], yi = ring[i][1];
    let xj = ring[j][0], yj = ring[j][1];
    // Normalise each vertex to the ring's reference longitude
    if (xi - refLng > 180) xi -= 360; else if (xi - refLng < -180) xi += 360;
    if (xj - refLng > 180) xj -= 360; else if (xj - refLng < -180) xj += 360;
    // Ensure the edge itself is consistent (handles antimeridian-crossing edges)
    if (xj - xi > 180) xj -= 360; else if (xj - xi < -180) xj += 360;
    if ((yi > lat) !== (yj > lat) && testLng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) {
      inside = !inside;
    }
  }
  return inside;
}

// --- Globe component ---
export function Globe({ pins, maxPins, onPinDrop, onPinRemove }: GlobeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const worldRef = useRef<any>(null);
  const rotRef = useRef<[number, number]>([30, 15]);
  const targetRotRef = useRef<[number, number]>([30, 15]);
  const draggingRef = useRef(false);
  const lastMouseRef = useRef<[number, number]>([0, 0]);
  const dragStartRef = useRef<[number, number]>([0, 0]);
  const autoRotRef = useRef(true);
  const animRef = useRef(0);
  const sizeRef = useRef({ w: 0, h: 0 });
  const [loaded, setLoaded] = useState(false);
  const [tooltip, setTooltip] = useState({ x: 0, y: 0, text: "", visible: false });
  const pulsesRef = useRef<{ lng: number; lat: number; color: string; time: number }[]>([]);
  const isTouchRef = useRef(false); // guard to suppress synthetic mouse events
  const touchTimerRef = useRef<ReturnType<typeof setTimeout>>();

  // Fetch world data
  useEffect(() => {
    fetch("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json")
      .then((r) => r.json())
      .then((topo) => {
        worldRef.current = decodeTopojson(topo);
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, []);

  // Find country at geographic coordinates — authoritative, no canvas/DPR complexity
  const findCountryGeo = useCallback(
    (lng: number, lat: number): { id: string; name: string } | null => {
      if (!worldRef.current) return null;
      for (const f of worldRef.current.features) {
        if (!f.geometry) continue;
        const polys =
          f.geometry.type === "Polygon"   ? [f.geometry.coordinates]
          : f.geometry.type === "MultiPolygon" ? f.geometry.coordinates
          : [];
        for (const polygon of polys) {
          if (!pointInPolygonGeo(lng, lat, polygon[0])) continue;
          // Check polygon holes (e.g. lakes inside countries)
          let inHole = false;
          for (let h = 1; h < polygon.length; h++) {
            if (pointInPolygonGeo(lng, lat, polygon[h])) { inHole = true; break; }
          }
          if (!inHole) {
            return { id: f.id, name: COUNTRY_NAMES[f.id] || f.properties?.name || "Unknown" };
          }
        }
      }
      return null;
    },
    []
  );

  const findNearestCity = useCallback((lng: number, lat: number): { name: string; country: string; lng: number; lat: number; dist: number } | null => {
    let best: typeof CITIES[0] | null = null;
    let bestDist = Infinity;

    for (const city of CITIES) {
      const d = geoDistanceDeg(lng, lat, city.lng, city.lat);
      if (d < bestDist) { bestDist = d; best = city; }
    }

    return best && bestDist < MAX_CITY_DIST_RAD
      ? { name: best.name, country: best.country, lng: best.lng, lat: best.lat, dist: bestDist }
      : null;
  }, []);

  // Rendering loop
  useEffect(() => {
    if (!loaded) return;
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext("2d")!;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = container.getBoundingClientRect();
      sizeRef.current = { w: rect.width, h: rect.height };
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = rect.width + "px";
      canvas.style.height = rect.height + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const draw = () => {
      const { w, h } = sizeRef.current;
      const R = Math.min(w, h) * 0.46;
      const cx = w / 2, cy = h / 2;

      // Smooth interpolation toward target
      const r = rotRef.current;
      const t = targetRotRef.current;
      rotRef.current = [r[0] + (t[0] - r[0]) * 0.06, r[1] + (t[1] - r[1]) * 0.06];

      if (autoRotRef.current && !draggingRef.current) {
        targetRotRef.current = [targetRotRef.current[0] + 0.06, targetRotRef.current[1]];
      }

      const [cLng, cLat] = rotRef.current;
      ctx.clearRect(0, 0, w, h);

      // Atmosphere
      const glowGrad = ctx.createRadialGradient(cx, cy, R * 0.92, cx, cy, R * 1.25);
      glowGrad.addColorStop(0, "rgba(60,120,220,0.06)");
      glowGrad.addColorStop(0.5, "rgba(60,120,220,0.02)");
      glowGrad.addColorStop(1, "transparent");
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, R * 1.25, 0, Math.PI * 2);
      ctx.fill();

      // Ocean sphere
      const oceanGrad = ctx.createRadialGradient(cx - R * 0.3, cy - R * 0.3, 0, cx, cy, R);
      oceanGrad.addColorStop(0, "#111927");
      oceanGrad.addColorStop(1, "#090e18");
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.fillStyle = oceanGrad;
      ctx.fill();
      ctx.strokeStyle = "rgba(80,140,240,0.06)";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Graticule: latitude lines
      ctx.strokeStyle = "rgba(255,255,255,0.02)";
      ctx.lineWidth = 0.5;
      for (let lat = -60; lat <= 60; lat += 30) {
        ctx.beginPath();
        let started = false;
        for (let lng = -180; lng <= 180; lng += 2) {
          const p = project(lng, lat, cLng, cLat, R, cx, cy);
          if (p) {
            if (!started) { ctx.moveTo(p[0], p[1]); started = true; }
            else ctx.lineTo(p[0], p[1]);
          } else { started = false; }
        }
        ctx.stroke();
      }
      // Longitude lines
      for (let lng = -180; lng < 180; lng += 30) {
        ctx.beginPath();
        let started = false;
        for (let lat = -90; lat <= 90; lat += 2) {
          const p = project(lng, lat, cLng, cLat, R, cx, cy);
          if (p) {
            if (!started) { ctx.moveTo(p[0], p[1]); started = true; }
            else ctx.lineTo(p[0], p[1]);
          } else { started = false; }
        }
        ctx.stroke();
      }

      // Countries
      if (worldRef.current) {
        for (const f of worldRef.current.features) {
          if (!f.geometry) continue;
          const rings = f.geometry.type === "Polygon"
            ? [f.geometry.coordinates]
            : f.geometry.type === "MultiPolygon"
            ? f.geometry.coordinates
            : [];

          ctx.beginPath();
          for (const polygon of rings) {
            for (const ring of polygon) {
              let moved = false;
              for (const [lng, lat] of ring) {
                const p = project(lng, lat, cLng, cLat, R, cx, cy);
                if (p) {
                  if (!moved) { ctx.moveTo(p[0], p[1]); moved = true; }
                  else ctx.lineTo(p[0], p[1]);
                }
              }
            }
          }
          ctx.fillStyle = "rgba(255,255,255,0.035)";
          ctx.fill();
          ctx.strokeStyle = "rgba(255,255,255,0.06)";
          ctx.lineWidth = 0.4;
          ctx.stroke();
        }
      }

      // Night-side shading — light source upper-left, consistent with ocean gradient
      const nightGrad = ctx.createRadialGradient(
        cx - R * 0.25, cy - R * 0.25, R * 0.35,
        cx + R * 0.15, cy + R * 0.15, R
      );
      nightGrad.addColorStop(0, "transparent");
      nightGrad.addColorStop(0.55, "rgba(3,7,18,0.08)");
      nightGrad.addColorStop(1, "rgba(3,7,18,0.72)");
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.clip();
      ctx.fillStyle = nightGrad;
      ctx.fillRect(cx - R, cy - R, R * 2, R * 2);
      ctx.restore();

      // Connecting arcs
      for (let i = 1; i < pins.length; i++) {
        const prev = pins[i - 1];
        const curr = pins[i];
        const interp = interpolateGreatCircle([prev.lng, prev.lat], [curr.lng, curr.lat]);
        ctx.beginPath();
        let started = false;
        for (let s = 0; s <= 1; s += 0.015) {
          const [lng, lat] = interp(s);
          const p = project(lng, lat, cLng, cLat, R, cx, cy);
          if (p) {
            if (!started) { ctx.moveTo(p[0], p[1]); started = true; }
            else ctx.lineTo(p[0], p[1]);
          } else { started = false; }
        }
        ctx.strokeStyle = `${curr.color}55`;
        ctx.lineWidth = 1.2;
        ctx.setLineDash([3, 4]);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Pulse animations
      const now = Date.now();
      pulsesRef.current = pulsesRef.current.filter((p) => now - p.time < 1500);
      for (const pulse of pulsesRef.current) {
        const elapsed = (now - pulse.time) / 1000;
        const p = project(pulse.lng, pulse.lat, cLng, cLat, R, cx, cy);
        if (!p) continue;
        const pR = 5 + elapsed * 35;
        const alpha = Math.max(0, 0.6 - elapsed / 1.5);
        ctx.beginPath();
        ctx.arc(p[0], p[1], pR, 0, Math.PI * 2);
        ctx.strokeStyle = pulse.color + Math.round(alpha * 255).toString(16).padStart(2, "0");
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      // Pins
      for (const pin of pins) {
        const p = project(pin.lng, pin.lat, cLng, cLat, R, cx, cy);
        if (!p) continue;

        // Glow
        const glow = ctx.createRadialGradient(p[0], p[1], 0, p[0], p[1], 20);
        glow.addColorStop(0, pin.color + "44");
        glow.addColorStop(1, pin.color + "00");
        ctx.fillStyle = glow;
        ctx.fillRect(p[0] - 20, p[1] - 20, 40, 40);

        // Diamond
        ctx.save();
        ctx.translate(p[0], p[1]);
        ctx.rotate(Math.PI / 4);
        ctx.fillStyle = pin.color;
        ctx.shadowColor = pin.color;
        ctx.shadowBlur = 10;
        ctx.fillRect(-4.5, -4.5, 9, 9);
        ctx.restore();
        ctx.shadowBlur = 0;

        // Number
        ctx.fillStyle = pin.color;
        ctx.font = "500 9px 'DM Mono', monospace";
        ctx.textAlign = "center";
        ctx.fillText(String(pin.id).padStart(2, "0"), p[0], p[1] - 15);

        // Label
        const label = pin.city || pin.country;
        ctx.fillStyle = "rgba(255,255,255,0.5)";
        ctx.font = "9px 'DM Mono', monospace";
        ctx.fillText(label, p[0], p[1] + 20);
      }

      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [loaded, pins]);

  // --- Interaction handlers ---
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (isTouchRef.current) return;
    draggingRef.current = true;
    lastMouseRef.current = [e.clientX, e.clientY];
    dragStartRef.current = [e.clientX, e.clientY];
    autoRotRef.current = false;
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (draggingRef.current) {
      const dx = e.clientX - lastMouseRef.current[0];
      const dy = e.clientY - lastMouseRef.current[1];
      targetRotRef.current = [
        targetRotRef.current[0] - dx * 0.25,
        Math.max(-70, Math.min(70, targetRotRef.current[1] + dy * 0.25)),
      ];
      lastMouseRef.current = [e.clientX, e.clientY];
      setTooltip((t) => ({ ...t, visible: false }));
    } else {
      // Tooltip on hover
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      const { w, h } = sizeRef.current;
      const R = Math.min(w, h) * 0.46;
      const cx = w / 2, cy = h / 2;
      const distFromCenter = Math.sqrt((mx - cx) ** 2 + (my - cy) ** 2);
      if (distFromCenter > R) {
        setTooltip((t) => ({ ...t, visible: false }));
        return;
      }

      const coords = unproject(mx, my, rotRef.current[0], rotRef.current[1], R, cx, cy);
      if (!coords) { setTooltip((t) => ({ ...t, visible: false })); return; }

      const [lng, lat] = coords;
      const country = findCountryGeo(lng, lat);
      const city = findNearestCity(lng, lat);

      // Mirror click resolution exactly so tooltip is a live preview of pin label
      let previewText: string;
      if (country) {
        previewText = (city && city.country === country.name)
          ? `${city.name}, ${country.name}`
          : country.name;
      } else if (city) {
        previewText = `${city.name}, ${city.country}`;
      } else {
        previewText = getWaterBodyName(lng, lat);
      }
      setTooltip({ x: e.clientX, y: e.clientY, text: previewText, visible: true });
    }
  }, [findCountryGeo, findNearestCity]);

  const handleMouseUp = useCallback((e: React.MouseEvent) => {
    if (isTouchRef.current) return;
    const dx = Math.abs(e.clientX - dragStartRef.current[0]);
    const dy = Math.abs(e.clientY - dragStartRef.current[1]);
    const wasClick = dx < 5 && dy < 5;
    draggingRef.current = false;
    setTimeout(() => { if (!draggingRef.current) autoRotRef.current = true; }, 5000);

    if (!wasClick) return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const { w, h } = sizeRef.current;
    const R = Math.min(w, h) * 0.46;
    const cx = w / 2, cy = h / 2;

    const distFromCenter = Math.sqrt((mx - cx) ** 2 + (my - cy) ** 2);
    if (distFromCenter > R) return;

    const coords = unproject(mx, my, rotRef.current[0], rotRef.current[1], R, cx, cy);
    if (!coords) return;

    const [lng, lat] = coords;

    // Check if click is near an existing pin — if so, remove it
    const PIN_HIT_RADIUS = 0.06; // ~6° angular distance
    for (const pin of pins) {
      const d = geoDistanceDeg(lng, lat, pin.lng, pin.lat);
      if (d < PIN_HIT_RADIUS) {
        if (onPinRemove) {
          pulsesRef.current.push({ lng: pin.lng, lat: pin.lat, color: "#ffffff", time: Date.now() });
          onPinRemove(pin.id);
        }
        return;
      }
    }

    // Don't add if already at max
    if (pins.length >= maxPins) return;

    const country = findCountryGeo(lng, lat);
    const city = findNearestCity(lng, lat);

    // Priority 1: polygon hit → authoritative for land
    // Priority 2: no polygon + nearby city → small island / TopoJSON gap
    // Priority 3: no polygon + no city → water body
    let countryName: string;
    let displayCity: string | null = city ? city.name : null;

    if (country) {
      countryName = country.name;
      // Only show city label when it belongs to the same polygon country
      if (city && city.country !== country.name) displayCity = null;
    } else if (city) {
      countryName = city.country;
    } else {
      countryName = getWaterBodyName(lng, lat);
      displayCity = null;
    }

    const musicalRegion = getMusicalRegion(countryName);
    const color = PIN_COLORS[pins.length % PIN_COLORS.length];

    pulsesRef.current.push({ lng, lat, color, time: Date.now() });

    onPinDrop({
      id: 0, // assigned by App.tsx via pinIdCounter
      lng, lat,
      country: countryName,
      city: displayCity || countryName,
      musicalRegion,
      color,
    });
  }, [pins, maxPins, findCountryGeo, findNearestCity, onPinDrop, onPinRemove]);

  const handleMouseLeave = useCallback(() => {
    draggingRef.current = false;
    setTooltip((t) => ({ ...t, visible: false }));
    setTimeout(() => { autoRotRef.current = true; }, 1500);
  }, []);

  // --- Touch handlers for mobile (use refs for latest props) ---
  const pinsRef = useRef(pins);
  pinsRef.current = pins;
  const onPinDropRef = useRef(onPinDrop);
  onPinDropRef.current = onPinDrop;
  const onPinRemoveRef = useRef(onPinRemove);
  onPinRemoveRef.current = onPinRemove;
  const findCountryGeoRef = useRef(findCountryGeo);
  findCountryGeoRef.current = findCountryGeo;
  const findNearestCityRef = useRef(findNearestCity);
  findNearestCityRef.current = findNearestCity;

  // Attach native touch listeners with { passive: false } so preventDefault() works
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const onTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      if (e.touches.length !== 1) return;
      const touch = e.touches[0];
      draggingRef.current = true;
      lastMouseRef.current = [touch.clientX, touch.clientY];
      dragStartRef.current = [touch.clientX, touch.clientY];
      autoRotRef.current = false;
      isTouchRef.current = true;
      clearTimeout(touchTimerRef.current);
    };

    const onTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      if (!draggingRef.current || e.touches.length !== 1) return;
      const touch = e.touches[0];
      const dx = touch.clientX - lastMouseRef.current[0];
      const dy = touch.clientY - lastMouseRef.current[1];
      targetRotRef.current = [
        targetRotRef.current[0] - dx * 0.25,
        Math.max(-70, Math.min(70, targetRotRef.current[1] + dy * 0.25)),
      ];
      lastMouseRef.current = [touch.clientX, touch.clientY];
    };

    const onTouchEnd = (e: TouchEvent) => {
      e.preventDefault();
      const touch = e.changedTouches[0];
      const dx = Math.abs(touch.clientX - dragStartRef.current[0]);
      const dy = Math.abs(touch.clientY - dragStartRef.current[1]);
      const wasClick = dx < 10 && dy < 10;
      draggingRef.current = false;
      setTimeout(() => { if (!draggingRef.current) autoRotRef.current = true; }, 5000);

      // Reset touch guard after delay
      touchTimerRef.current = setTimeout(() => { isTouchRef.current = false; }, 500);

      if (!wasClick) return;

      const rect = canvas.getBoundingClientRect();
      const mx = touch.clientX - rect.left;
      const my = touch.clientY - rect.top;
      const { w, h } = sizeRef.current;
      const R = Math.min(w, h) * 0.46;
      const cx = w / 2, cy = h / 2;

      const distFromCenter = Math.sqrt((mx - cx) ** 2 + (my - cy) ** 2);
      if (distFromCenter > R) return;

      const coords = unproject(mx, my, rotRef.current[0], rotRef.current[1], R, cx, cy);
      if (!coords) return;

      const [lng, lat] = coords;
      const currentPins = pinsRef.current;

      // Check if tap is near an existing pin — remove it
      const PIN_HIT_RADIUS = 0.08;
      for (const pin of currentPins) {
        const d = geoDistanceDeg(lng, lat, pin.lng, pin.lat);
        if (d < PIN_HIT_RADIUS) {
          if (onPinRemoveRef.current) {
            pulsesRef.current.push({ lng: pin.lng, lat: pin.lat, color: "#ffffff", time: Date.now() });
            onPinRemoveRef.current(pin.id);
          }
          return;
        }
      }

      if (currentPins.length >= maxPins) return;

      const country = findCountryGeoRef.current(lng, lat);
      const city = findNearestCityRef.current(lng, lat);

      // Priority 1: polygon hit → authoritative for land
      // Priority 2: no polygon + nearby city → small island / TopoJSON gap
      // Priority 3: no polygon + no city → water body
      let countryName: string;
      let displayCity: string | null = city ? city.name : null;

      if (country) {
        countryName = country.name;
        if (city && city.country !== country.name) displayCity = null;
      } else if (city) {
        countryName = city.country;
      } else {
        countryName = getWaterBodyName(lng, lat);
        displayCity = null;
      }

      const musicalRegion = getMusicalRegion(countryName);
      const color = PIN_COLORS[currentPins.length % PIN_COLORS.length];

      pulsesRef.current.push({ lng, lat, color, time: Date.now() });

      onPinDropRef.current({
        id: 0, // assigned by App.tsx via pinIdCounter
        lng, lat,
        country: countryName,
        city: displayCity || countryName,
        musicalRegion,
        color,
      });
    };

    canvas.addEventListener("touchstart", onTouchStart, { passive: false });
    canvas.addEventListener("touchmove", onTouchMove, { passive: false });
    canvas.addEventListener("touchend", onTouchEnd, { passive: false });

    return () => {
      canvas.removeEventListener("touchstart", onTouchStart);
      canvas.removeEventListener("touchmove", onTouchMove);
      canvas.removeEventListener("touchend", onTouchEnd);
    };
  }, [maxPins]);

  return (
    <div ref={containerRef} className="absolute inset-0" style={{ cursor: "crosshair", touchAction: "none" }}>
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <span style={{
            fontFamily: "'DM Mono', monospace", fontSize: 11,
            color: "rgba(255,255,255,0.2)", letterSpacing: "0.15em",
            textTransform: "uppercase",
          }}>
            Loading globe data...
          </span>
        </div>
      )}
      <canvas
        ref={canvasRef}
        className="absolute inset-0"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      />
      {tooltip.visible && (
        <div
          className="fixed pointer-events-none z-50"
          style={{
            left: tooltip.x + 16,
            top: tooltip.y - 12,
            fontFamily: "'DM Mono', monospace",
            fontSize: 10,
            color: "rgba(255,255,255,0.65)",
            letterSpacing: "0.05em",
            backgroundColor: "rgba(10,14,24,0.92)",
            border: "1px solid rgba(255,255,255,0.08)",
            padding: "5px 10px",
            borderRadius: 3,
            whiteSpace: "nowrap",
            backdropFilter: "blur(8px)",
          }}
        >
          {tooltip.text}
        </div>
      )}
    </div>
  );
}