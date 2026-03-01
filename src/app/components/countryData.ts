// ISO 3166-1 numeric code to country name mapping
export const COUNTRY_NAMES: Record<string, string> = {
  "004": "Afghanistan", "008": "Albania", "012": "Algeria", "016": "American Samoa",
  "020": "Andorra", "024": "Angola", "032": "Argentina", "036": "Australia",
  "040": "Austria", "044": "Bahamas", "048": "Bahrain", "050": "Bangladesh",
  "051": "Armenia", "056": "Belgium", "064": "Bhutan", "068": "Bolivia",
  "070": "Bosnia and Herzegovina", "072": "Botswana", "076": "Brazil",
  "084": "Belize", "090": "Solomon Islands", "096": "Brunei", "100": "Bulgaria",
  "104": "Myanmar", "108": "Burundi", "112": "Belarus", "116": "Cambodia",
  "120": "Cameroon", "124": "Canada", "140": "Central African Republic",
  "144": "Sri Lanka", "148": "Chad", "152": "Chile", "156": "China",
  "158": "Taiwan", "170": "Colombia", "178": "Congo", "180": "DR Congo",
  "188": "Costa Rica", "191": "Croatia", "192": "Cuba", "196": "Cyprus",
  "203": "Czech Republic", "204": "Benin", "208": "Denmark", "214": "Dominican Republic",
  "218": "Ecuador", "222": "El Salvador", "226": "Equatorial Guinea",
  "231": "Ethiopia", "232": "Eritrea", "233": "Estonia", "234": "Faroe Islands",
  "242": "Fiji", "246": "Finland", "250": "France", "262": "Djibouti",
  "266": "Gabon", "268": "Georgia", "270": "Gambia", "275": "Palestine",
  "276": "Germany", "288": "Ghana", "300": "Greece", "308": "Grenada",
  "320": "Guatemala", "324": "Guinea", "328": "Guyana", "332": "Haiti",
  "340": "Honduras", "344": "Hong Kong", "348": "Hungary", "352": "Iceland",
  "356": "India", "360": "Indonesia", "364": "Iran", "368": "Iraq",
  "372": "Ireland", "376": "Israel", "380": "Italy", "384": "Ivory Coast",
  "388": "Jamaica", "392": "Japan", "398": "Kazakhstan", "400": "Jordan",
  "404": "Kenya", "408": "North Korea", "410": "South Korea", "414": "Kuwait",
  "417": "Kyrgyzstan", "418": "Laos", "422": "Lebanon", "426": "Lesotho",
  "428": "Latvia", "430": "Liberia", "434": "Libya", "440": "Lithuania",
  "442": "Luxembourg", "450": "Madagascar", "454": "Malawi", "458": "Malaysia",
  "462": "Maldives", "466": "Mali", "470": "Malta", "478": "Mauritania",
  "480": "Mauritius", "484": "Mexico", "496": "Mongolia", "498": "Moldova",
  "499": "Montenegro", "504": "Morocco", "508": "Mozambique", "512": "Oman",
  "516": "Namibia", "524": "Nepal", "528": "Netherlands", "540": "New Caledonia",
  "548": "Vanuatu", "554": "New Zealand", "558": "Nicaragua", "562": "Niger",
  "566": "Nigeria", "578": "Norway", "586": "Pakistan", "591": "Panama",
  "598": "Papua New Guinea", "600": "Paraguay", "604": "Peru",
  "608": "Philippines", "616": "Poland", "620": "Portugal", "630": "Puerto Rico",
  "634": "Qatar", "642": "Romania", "643": "Russia", "646": "Rwanda",
  "682": "Saudi Arabia", "686": "Senegal", "688": "Serbia", "694": "Sierra Leone",
  "702": "Singapore", "703": "Slovakia", "704": "Vietnam", "705": "Slovenia",
  "706": "Somalia", "710": "South Africa", "716": "Zimbabwe", "724": "Spain",
  "728": "South Sudan", "729": "Sudan", "732": "Western Sahara", "740": "Suriname",
  "748": "Eswatini", "752": "Sweden", "756": "Switzerland", "760": "Syria",
  "762": "Tajikistan", "764": "Thailand", "768": "Togo", "780": "Trinidad and Tobago",
  "784": "United Arab Emirates", "788": "Tunisia", "792": "Turkey",
  "795": "Turkmenistan", "800": "Uganda", "804": "Ukraine",
  "807": "North Macedonia", "818": "Egypt", "826": "United Kingdom",
  "834": "Tanzania", "840": "United States", "854": "Burkina Faso",
  "858": "Uruguay", "860": "Uzbekistan", "862": "Venezuela", "887": "Yemen",
  "894": "Zambia", "10": "Antarctica", "-99": "Northern Cyprus", "890": "Kosovo",
};

// City list lives in cityData.ts — import CITIES from there directly.
export { CITIES } from "./cityData";

// Water body coordinate-based detection
export function getWaterBodyName(lng: number, lat: number): string {
  // Polar oceans first
  if (lat > 66) return "Arctic Ocean";
  if (lat < -60) return "Southern Ocean";

  // Named seas (check before major oceans — order matters)
  if (lat > 30 && lat < 47 && lng > -5 && lng < 36) return "Mediterranean Sea";
  if (lat > 40 && lat < 47 && lng > 27 && lng < 42) return "Black Sea";
  if (lat > 36 && lat < 47 && lng > 49 && lng < 55) return "Caspian Sea";
  if (lat > 12 && lat < 30 && lng > 32 && lng < 44) return "Red Sea";
  if (lat > 22 && lat < 30 && lng > 48 && lng < 57) return "Persian Gulf";
  if (lat > 5  && lat < 25 && lng > 55 && lng < 78) return "Arabian Sea";
  if (lat > 5  && lat < 22 && lng > 80 && lng < 100) return "Bay of Bengal";
  if (lat > 0  && lat < 25 && lng > 100 && lng < 122) return "South China Sea";
  if (lat > 30 && lat < 41 && lng > 119 && lng < 127) return "Yellow Sea";
  if (lat > 32 && lat < 52 && lng > 128 && lng < 142) return "Sea of Japan";
  if (lat > 52 && lat < 67 && (lng < -158 || lng > 162)) return "Bering Sea";
  if (lat > 53 && lat < 66 && lng > 10  && lng < 30) return "Baltic Sea";
  if (lat > 51 && lat < 62 && lng > -4  && lng < 9)  return "North Sea";
  if (lat > 62 && lat < 75 && lng > -15 && lng < 20) return "Norwegian Sea";
  if (lat > 9  && lat < 24 && lng > -90 && lng < -59) return "Caribbean Sea";
  if (lat > 18 && lat < 31 && lng > -98 && lng < -80) return "Gulf of Mexico";
  if (lat > 50 && lat < 67 && lng > -95 && lng < -65) return "Hudson Bay";
  if (lat > -25 && lat < -10 && lng > 142 && lng < 160) return "Coral Sea";
  if (lat > -48 && lat < -30 && lng > 147 && lng < 175) return "Tasman Sea";

  // Major oceans (fallback)
  if (lng > 20 && lng < 147 && lat < 30 && lat > -60) return "Indian Ocean";
  if (lng > 120 || lng < -70) return "Pacific Ocean";
  return "Atlantic Ocean";
}

const WATER_BODIES = new Set([
  "Pacific Ocean", "Atlantic Ocean", "Indian Ocean",
  "Arctic Ocean", "Southern Ocean", "Mediterranean Sea",
  "Black Sea", "Caspian Sea", "Red Sea", "Persian Gulf",
  "Arabian Sea", "Bay of Bengal", "South China Sea",
  "Yellow Sea", "Sea of Japan", "Bering Sea", "Baltic Sea",
  "North Sea", "Norwegian Sea", "Caribbean Sea",
  "Gulf of Mexico", "Hudson Bay", "Coral Sea", "Tasman Sea",
]);

// Map countries to musical regions
export function getMusicalRegion(country: string): string {
  if (WATER_BODIES.has(country)) return country; // pass-through for water bodies
  const regionMap: Record<string, string[]> = {
    "West Africa": ["Nigeria", "Ghana", "Senegal", "Gambia", "Sierra Leone", "Guinea", "Ivory Coast", "Mali", "Burkina Faso", "Togo", "Benin", "Niger", "Liberia"],
    "East Africa": ["Kenya", "Tanzania", "Ethiopia", "Uganda", "Rwanda", "Eritrea", "Djibouti", "Somalia", "Burundi"],
    "Southern Africa": ["South Africa", "Zimbabwe", "Mozambique", "Botswana", "Namibia", "Zambia", "Malawi", "Lesotho", "Eswatini", "Madagascar", "Angola", "Mauritius"],
    "North Africa": ["Morocco", "Egypt", "Tunisia", "Algeria", "Libya", "Western Sahara", "Sudan"],
    "Central Africa": ["DR Congo", "Congo", "Cameroon", "Central African Republic", "Gabon", "Equatorial Guinea", "Chad", "South Sudan"],
    "East Asia": ["Japan", "South Korea", "North Korea", "China", "Taiwan", "Hong Kong", "Mongolia"],
    "South Asia": ["India", "Pakistan", "Bangladesh", "Sri Lanka", "Nepal", "Bhutan", "Maldives"],
    "Southeast Asia": ["Thailand", "Vietnam", "Indonesia", "Philippines", "Malaysia", "Singapore", "Myanmar", "Cambodia", "Laos", "Brunei"],
    "Middle East": ["Iran", "Iraq", "Saudi Arabia", "United Arab Emirates", "Qatar", "Kuwait", "Oman", "Bahrain", "Israel", "Palestine", "Lebanon", "Jordan", "Syria", "Yemen", "Turkey"],
    "Western Europe": ["United Kingdom", "France", "Germany", "Netherlands", "Belgium", "Luxembourg", "Ireland", "Switzerland", "Austria"],
    "Southern Europe": ["Italy", "Spain", "Portugal", "Greece", "Malta", "Cyprus"],
    "Northern Europe": ["Sweden", "Norway", "Denmark", "Finland", "Iceland", "Estonia", "Latvia", "Lithuania", "Faroe Islands"],
    "Eastern Europe": ["Russia", "Poland", "Czech Republic", "Hungary", "Romania", "Bulgaria", "Serbia", "Croatia", "Slovenia", "Slovakia", "Bosnia and Herzegovina", "North Macedonia", "Montenegro", "Moldova", "Ukraine", "Belarus", "Georgia", "Armenia", "Azerbaijan", "Kosovo", "Albania", "Northern Cyprus"],
    "North America": ["United States", "Canada"],
    "Central America": ["Mexico", "Guatemala", "Honduras", "El Salvador", "Nicaragua", "Costa Rica", "Panama", "Belize", "Cuba", "Haiti", "Dominican Republic", "Jamaica", "Puerto Rico", "Trinidad and Tobago", "Bahamas", "Grenada"],
    "South America": ["Brazil", "Argentina", "Chile", "Colombia", "Peru", "Venezuela", "Ecuador", "Bolivia", "Paraguay", "Uruguay", "Guyana", "Suriname"],
    "Oceania": ["Australia", "New Zealand", "Fiji", "Papua New Guinea", "Vanuatu", "Solomon Islands", "New Caledonia"],
    "Central Asia": ["Kazakhstan", "Uzbekistan", "Turkmenistan", "Tajikistan", "Kyrgyzstan", "Afghanistan"],
  };

  for (const [region, countries] of Object.entries(regionMap)) {
    if (countries.includes(country)) return region;
  }
  return "Unknown";
}

// Simplified region for display
export function getSimpleRegion(musicalRegion: string): string {
  if (musicalRegion.includes("Africa")) return "Africa";
  if (musicalRegion.includes("Asia") || musicalRegion === "Middle East") return "Asia";
  if (musicalRegion.includes("Europe")) return "Europe";
  if (musicalRegion.includes("America")) return "Americas";
  if (musicalRegion === "Oceania") return "Oceania";
  return musicalRegion;
}