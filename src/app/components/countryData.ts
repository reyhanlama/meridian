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

// Major world cities with coordinates [lng, lat] — curated ~141-city list
export const CITIES: { name: string; country: string; lng: number; lat: number }[] = [
  // North America
  { name: "New York", country: "United States", lng: -74.0, lat: 40.71 },
  { name: "Los Angeles", country: "United States", lng: -118.24, lat: 34.05 },
  { name: "Chicago", country: "United States", lng: -87.63, lat: 41.88 },
  { name: "Miami", country: "United States", lng: -80.19, lat: 25.76 },
  { name: "San Francisco", country: "United States", lng: -122.42, lat: 37.77 },
  { name: "Seattle", country: "United States", lng: -122.33, lat: 47.61 },
  { name: "Nashville", country: "United States", lng: -86.78, lat: 36.16 },
  { name: "New Orleans", country: "United States", lng: -90.07, lat: 29.95 },
  { name: "Washington D.C.", country: "United States", lng: -77.04, lat: 38.91 },
  { name: "Honolulu", country: "United States", lng: -157.86, lat: 21.31 },
  { name: "Toronto", country: "Canada", lng: -79.38, lat: 43.65 },
  { name: "Vancouver", country: "Canada", lng: -123.12, lat: 49.28 },
  { name: "Mexico City", country: "Mexico", lng: -99.13, lat: 19.43 },
  { name: "Havana", country: "Cuba", lng: -82.37, lat: 23.11 },
  { name: "Santo Domingo", country: "Dominican Republic", lng: -69.90, lat: 18.48 },
  { name: "Port-au-Prince", country: "Haiti", lng: -72.34, lat: 18.54 },
  { name: "San Juan", country: "Puerto Rico", lng: -66.11, lat: 18.47 },
  { name: "Port of Spain", country: "Trinidad and Tobago", lng: -61.52, lat: 10.65 },
  { name: "Guatemala City", country: "Guatemala", lng: -90.51, lat: 14.64 },
  { name: "San José", country: "Costa Rica", lng: -84.09, lat: 9.93 },
  { name: "Guadalajara", country: "Mexico", lng: -103.35, lat: 20.66 },
  { name: "Monterrey", country: "Mexico", lng: -100.32, lat: 25.67 },
  // South & Central America
  { name: "São Paulo", country: "Brazil", lng: -46.63, lat: -23.55 },
  { name: "Rio de Janeiro", country: "Brazil", lng: -43.17, lat: -22.91 },
  { name: "Buenos Aires", country: "Argentina", lng: -58.38, lat: -34.60 },
  { name: "Bogotá", country: "Colombia", lng: -74.07, lat: 4.71 },
  { name: "Lima", country: "Peru", lng: -77.03, lat: -12.05 },
  { name: "Santiago", country: "Chile", lng: -70.67, lat: -33.45 },
  { name: "Medellín", country: "Colombia", lng: -75.56, lat: 6.25 },
  { name: "Quito", country: "Ecuador", lng: -78.52, lat: -0.18 },
  { name: "Caracas", country: "Venezuela", lng: -66.90, lat: 10.49 },
  { name: "La Paz", country: "Bolivia", lng: -68.15, lat: -16.50 },
  { name: "Panama City", country: "Panama", lng: -79.52, lat: 8.98 },
  { name: "Kingston", country: "Jamaica", lng: -76.79, lat: 18.00 },
  // South America (additional)
  { name: "Montevideo", country: "Uruguay", lng: -56.17, lat: -34.90 },
  { name: "Asunción", country: "Paraguay", lng: -57.64, lat: -25.29 },
  { name: "Manaus", country: "Brazil", lng: -60.01, lat: -3.10 },
  { name: "Fortaleza", country: "Brazil", lng: -38.54, lat: -3.72 },
  { name: "Recife", country: "Brazil", lng: -34.88, lat: -8.05 },
  { name: "Cali", country: "Colombia", lng: -76.53, lat: 3.44 },
  // Western Europe
  { name: "London", country: "United Kingdom", lng: -0.13, lat: 51.51 },
  { name: "Paris", country: "France", lng: 2.35, lat: 48.86 },
  { name: "Berlin", country: "Germany", lng: 13.40, lat: 52.52 },
  { name: "Rome", country: "Italy", lng: 12.50, lat: 41.90 },
  { name: "Madrid", country: "Spain", lng: -3.70, lat: 40.42 },
  { name: "Barcelona", country: "Spain", lng: 2.17, lat: 41.39 },
  { name: "Amsterdam", country: "Netherlands", lng: 4.90, lat: 52.37 },
  { name: "Vienna", country: "Austria", lng: 16.37, lat: 48.21 },
  { name: "Lisbon", country: "Portugal", lng: -9.14, lat: 38.74 },
  { name: "Athens", country: "Greece", lng: 23.73, lat: 37.98 },
  { name: "Dublin", country: "Ireland", lng: -6.26, lat: 53.35 },
  { name: "Edinburgh", country: "United Kingdom", lng: -3.19, lat: 55.95 },
  { name: "Zurich", country: "Switzerland", lng: 8.54, lat: 47.38 },
  { name: "Brussels", country: "Belgium", lng: 4.35, lat: 50.85 },
  { name: "Geneva", country: "Switzerland", lng: 6.14, lat: 46.20 },
  { name: "Milan", country: "Italy", lng: 9.19, lat: 45.46 },
  { name: "Hamburg", country: "Germany", lng: 9.99, lat: 53.55 },
  { name: "Porto", country: "Portugal", lng: -8.61, lat: 41.15 },
  { name: "Seville", country: "Spain", lng: -5.99, lat: 37.39 },
  { name: "Lyon", country: "France", lng: 4.83, lat: 45.76 },
  // Northern Europe
  { name: "Stockholm", country: "Sweden", lng: 18.07, lat: 59.33 },
  { name: "Oslo", country: "Norway", lng: 10.75, lat: 59.91 },
  { name: "Copenhagen", country: "Denmark", lng: 12.57, lat: 55.68 },
  { name: "Helsinki", country: "Finland", lng: 24.94, lat: 60.17 },
  { name: "Reykjavik", country: "Iceland", lng: -21.90, lat: 64.15 },
  { name: "Tallinn", country: "Estonia", lng: 24.75, lat: 59.44 },
  // Eastern Europe
  { name: "Moscow", country: "Russia", lng: 37.62, lat: 55.76 },
  { name: "St. Petersburg", country: "Russia", lng: 30.32, lat: 59.93 },
  { name: "Warsaw", country: "Poland", lng: 21.01, lat: 52.23 },
  { name: "Budapest", country: "Hungary", lng: 19.04, lat: 47.50 },
  { name: "Prague", country: "Czech Republic", lng: 14.42, lat: 50.08 },
  { name: "Bucharest", country: "Romania", lng: 26.10, lat: 44.43 },
  { name: "Belgrade", country: "Serbia", lng: 20.46, lat: 44.79 },
  { name: "Kyiv", country: "Ukraine", lng: 30.52, lat: 50.45 },
  { name: "Tbilisi", country: "Georgia", lng: 44.83, lat: 41.72 },
  { name: "Baku", country: "Azerbaijan", lng: 49.87, lat: 40.41 },
  { name: "Sofia", country: "Bulgaria", lng: 23.32, lat: 42.70 },
  { name: "Zagreb", country: "Croatia", lng: 15.97, lat: 45.81 },
  { name: "Vilnius", country: "Lithuania", lng: 25.28, lat: 54.69 },
  { name: "Riga", country: "Latvia", lng: 24.11, lat: 56.95 },
  // Southern Europe / Mediterranean
  { name: "Istanbul", country: "Turkey", lng: 28.98, lat: 41.01 },
  { name: "Naples", country: "Italy", lng: 14.27, lat: 40.85 },
  { name: "Venice", country: "Italy", lng: 12.34, lat: 45.44 },
  { name: "Florence", country: "Italy", lng: 11.26, lat: 43.77 },
  { name: "Dubrovnik", country: "Croatia", lng: 18.09, lat: 42.65 },
  { name: "Thessaloniki", country: "Greece", lng: 22.94, lat: 40.64 },
  { name: "Ankara", country: "Turkey", lng: 32.86, lat: 39.93 },
  // North Africa
  { name: "Cairo", country: "Egypt", lng: 31.24, lat: 30.04 },
  { name: "Casablanca", country: "Morocco", lng: -7.59, lat: 33.57 },
  { name: "Marrakech", country: "Morocco", lng: -8.00, lat: 31.63 },
  { name: "Tunis", country: "Tunisia", lng: 10.17, lat: 36.81 },
  { name: "Algiers", country: "Algeria", lng: 3.04, lat: 36.75 },
  { name: "Alexandria", country: "Egypt", lng: 29.92, lat: 31.20 },
  // West Africa
  { name: "Lagos", country: "Nigeria", lng: 3.39, lat: 6.52 },
  { name: "Accra", country: "Ghana", lng: -0.19, lat: 5.56 },
  { name: "Dakar", country: "Senegal", lng: -17.47, lat: 14.72 },
  { name: "Abuja", country: "Nigeria", lng: 7.49, lat: 9.06 },
  { name: "Douala", country: "Cameroon", lng: 9.77, lat: 4.05 },
  { name: "Bamako", country: "Mali", lng: -8.00, lat: 12.65 },
  { name: "Conakry", country: "Guinea", lng: -13.68, lat: 9.54 },
  { name: "Freetown", country: "Sierra Leone", lng: -13.23, lat: 8.49 },
  { name: "Lomé", country: "Togo", lng: 1.22, lat: 6.14 },
  // Central Africa
  { name: "Kinshasa", country: "DR Congo", lng: 15.32, lat: -4.32 },
  { name: "Brazzaville", country: "Congo", lng: 15.28, lat: -4.27 },
  { name: "Bangui", country: "Central African Republic", lng: 18.56, lat: 4.36 },
  { name: "Libreville", country: "Gabon", lng: 9.45, lat: 0.39 },
  // East Africa
  { name: "Nairobi", country: "Kenya", lng: 36.82, lat: -1.29 },
  { name: "Addis Ababa", country: "Ethiopia", lng: 38.75, lat: 9.02 },
  { name: "Dar es Salaam", country: "Tanzania", lng: 39.27, lat: -6.79 },
  { name: "Kampala", country: "Uganda", lng: 32.58, lat: 0.35 },
  { name: "Kigali", country: "Rwanda", lng: 29.87, lat: -1.94 },
  { name: "Zanzibar", country: "Tanzania", lng: 39.19, lat: -6.17 },
  { name: "Mombasa", country: "Kenya", lng: 39.67, lat: -4.05 },
  { name: "Asmara", country: "Eritrea", lng: 38.93, lat: 15.34 },
  // Southern Africa
  { name: "Cape Town", country: "South Africa", lng: 18.42, lat: -33.93 },
  { name: "Johannesburg", country: "South Africa", lng: 28.05, lat: -26.20 },
  { name: "Maputo", country: "Mozambique", lng: 32.57, lat: -25.97 },
  { name: "Windhoek", country: "Namibia", lng: 17.08, lat: -22.57 },
  { name: "Lusaka", country: "Zambia", lng: 28.28, lat: -15.39 },
  { name: "Harare", country: "Zimbabwe", lng: 31.05, lat: -17.83 },
  { name: "Gaborone", country: "Botswana", lng: 25.91, lat: -24.65 },
  { name: "Antananarivo", country: "Madagascar", lng: 47.52, lat: -18.91 },
  // Middle East
  { name: "Dubai", country: "United Arab Emirates", lng: 55.27, lat: 25.20 },
  { name: "Riyadh", country: "Saudi Arabia", lng: 46.68, lat: 24.69 },
  { name: "Tehran", country: "Iran", lng: 51.39, lat: 35.69 },
  { name: "Jerusalem", country: "Israel", lng: 35.23, lat: 31.77 },
  { name: "Beirut", country: "Lebanon", lng: 35.50, lat: 33.89 },
  { name: "Baghdad", country: "Iraq", lng: 44.37, lat: 33.31 },
  { name: "Doha", country: "Qatar", lng: 51.53, lat: 25.29 },
  { name: "Muscat", country: "Oman", lng: 58.59, lat: 23.59 },
  { name: "Amman", country: "Jordan", lng: 35.95, lat: 31.95 },
  { name: "Mecca", country: "Saudi Arabia", lng: 39.82, lat: 21.39 },
  // South Asia
  { name: "Mumbai", country: "India", lng: 72.88, lat: 19.08 },
  { name: "Delhi", country: "India", lng: 77.10, lat: 28.70 },
  { name: "Bangalore", country: "India", lng: 77.59, lat: 12.97 },
  { name: "Chennai", country: "India", lng: 80.27, lat: 13.08 },
  { name: "Kolkata", country: "India", lng: 88.36, lat: 22.57 },
  { name: "Karachi", country: "Pakistan", lng: 67.01, lat: 24.86 },
  { name: "Dhaka", country: "Bangladesh", lng: 90.41, lat: 23.81 },
  { name: "Colombo", country: "Sri Lanka", lng: 79.86, lat: 6.93 },
  { name: "Kathmandu", country: "Nepal", lng: 85.32, lat: 27.72 },
  { name: "Varanasi", country: "India", lng: 83.00, lat: 25.32 },
  { name: "Goa", country: "India", lng: 73.88, lat: 15.50 },
  { name: "Jaipur", country: "India", lng: 75.79, lat: 26.92 },
  { name: "Lahore", country: "Pakistan", lng: 74.35, lat: 31.55 },
  { name: "Hyderabad", country: "India", lng: 78.48, lat: 17.38 },
  { name: "Pune", country: "India", lng: 73.85, lat: 18.52 },
  // Central Asia
  { name: "Tashkent", country: "Uzbekistan", lng: 69.28, lat: 41.30 },
  { name: "Almaty", country: "Kazakhstan", lng: 76.95, lat: 43.24 },
  { name: "Samarkand", country: "Uzbekistan", lng: 66.96, lat: 39.65 },
  { name: "Kabul", country: "Afghanistan", lng: 69.17, lat: 34.53 },
  { name: "Bishkek", country: "Kyrgyzstan", lng: 74.59, lat: 42.87 },
  { name: "Ashgabat", country: "Turkmenistan", lng: 58.38, lat: 37.95 },
  // East Asia
  { name: "Tokyo", country: "Japan", lng: 139.69, lat: 35.69 },
  { name: "Kyoto", country: "Japan", lng: 135.77, lat: 35.01 },
  { name: "Osaka", country: "Japan", lng: 135.50, lat: 34.69 },
  { name: "Beijing", country: "China", lng: 116.41, lat: 39.90 },
  { name: "Shanghai", country: "China", lng: 121.47, lat: 31.23 },
  { name: "Guangzhou", country: "China", lng: 113.26, lat: 23.13 },
  { name: "Hong Kong", country: "Hong Kong", lng: 114.17, lat: 22.28 },
  { name: "Seoul", country: "South Korea", lng: 126.98, lat: 37.57 },
  { name: "Taipei", country: "Taiwan", lng: 121.57, lat: 25.03 },
  { name: "Ulaanbaatar", country: "Mongolia", lng: 106.91, lat: 47.92 },
  { name: "Chengdu", country: "China", lng: 104.07, lat: 30.67 },
  { name: "Xi'an", country: "China", lng: 108.94, lat: 34.34 },
  { name: "Busan", country: "South Korea", lng: 129.06, lat: 35.10 },
  { name: "Nanjing", country: "China", lng: 118.78, lat: 32.06 },
  // Southeast Asia
  { name: "Singapore", country: "Singapore", lng: 103.82, lat: 1.35 },
  { name: "Bangkok", country: "Thailand", lng: 100.50, lat: 13.76 },
  { name: "Chiang Mai", country: "Thailand", lng: 98.98, lat: 18.79 },
  { name: "Kuala Lumpur", country: "Malaysia", lng: 101.69, lat: 3.14 },
  { name: "Jakarta", country: "Indonesia", lng: 106.85, lat: -6.21 },
  { name: "Bali", country: "Indonesia", lng: 115.19, lat: -8.41 },
  { name: "Manila", country: "Philippines", lng: 120.98, lat: 14.60 },
  { name: "Hanoi", country: "Vietnam", lng: 105.83, lat: 21.03 },
  { name: "Ho Chi Minh City", country: "Vietnam", lng: 106.63, lat: 10.82 },
  { name: "Yangon", country: "Myanmar", lng: 96.20, lat: 16.87 },
  { name: "Phnom Penh", country: "Cambodia", lng: 104.92, lat: 11.56 },
  { name: "Vientiane", country: "Laos", lng: 102.60, lat: 17.97 },
  { name: "Cebu", country: "Philippines", lng: 123.89, lat: 10.32 },
  { name: "Medan", country: "Indonesia", lng: 98.67, lat: 3.59 },
  // Oceania
  { name: "Sydney", country: "Australia", lng: 151.21, lat: -33.87 },
  { name: "Melbourne", country: "Australia", lng: 144.96, lat: -37.81 },
  { name: "Brisbane", country: "Australia", lng: 153.03, lat: -27.47 },
  { name: "Auckland", country: "New Zealand", lng: 174.76, lat: -36.85 },
  { name: "Suva", country: "Fiji", lng: 178.44, lat: -18.14 },
  { name: "Perth", country: "Australia", lng: 115.86, lat: -31.95 },
  { name: "Darwin", country: "Australia", lng: 130.84, lat: -12.46 },
  { name: "Christchurch", country: "New Zealand", lng: 172.63, lat: -43.53 },
  { name: "Port Moresby", country: "Papua New Guinea", lng: 147.19, lat: -9.46 },
  { name: "Port Vila", country: "Vanuatu", lng: 168.32, lat: -17.73 },
  // Russia (additional coverage beyond Moscow/St. Petersburg)
  { name: "Vladivostok", country: "Russia", lng: 131.89, lat: 43.12 },
  { name: "Sochi", country: "Russia", lng: 39.72, lat: 43.60 },
  { name: "Novosibirsk", country: "Russia", lng: 82.93, lat: 54.99 },
  { name: "Yekaterinburg", country: "Russia", lng: 60.61, lat: 56.84 },
  { name: "Irkutsk", country: "Russia", lng: 104.28, lat: 52.30 },
  // United States (additional)
  { name: "Las Vegas", country: "United States", lng: -115.14, lat: 36.17 },
  { name: "Atlanta", country: "United States", lng: -84.39, lat: 33.75 },
  { name: "Denver", country: "United States", lng: -104.99, lat: 39.74 },
  { name: "Boston", country: "United States", lng: -71.06, lat: 42.36 },
  { name: "Portland", country: "United States", lng: -122.68, lat: 45.52 },
];

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