/**
 * Real-Time Agricultural & Farming Stores & Services Service
 * Powered by OpenStreetMap Overpass API, Nominatim Geocoding, OSRM Routing, and Geolocation API
 * 100% Free & Open - Zero Required API Keys - 100% Real Live OSM Data
 */

export type FarmingCategory =
  | 'all'
  | 'medicine'
  | 'pesticide'
  | 'fertilizer'
  | 'seeds'
  | 'agri_input'
  | 'krishi_kendra'
  | 'agri_equipment'
  | 'tractor_machinery'
  | 'nursery'
  | 'veterinary'
  | 'other_services';

export interface MedicalStore {
  id: string;
  name: string;
  category: FarmingCategory;
  categoryKey: string;
  latitude: number;
  longitude: number;
  distanceMeters: number;
  distanceFormatted: string;
  address: string;
  phone?: string;
  website?: string;
  openingHours?: string;
  isOpen?: boolean;
  rating?: number;
  source: 'osm' | 'google';
  rawTags?: Record<string, string>;
}

export interface UserCoordinates {
  latitude: number;
  longitude: number;
  accuracyMeters?: number;
  altitudeMeters?: number;
  timestamp?: number;
}

export interface LocationDetails {
  placeName: string;
  villageOrArea: string;
  cityOrTown: string;
  subDistrict?: string;
  district: string;
  state: string;
  postcode?: string;
  country: string;
  fullAddress: string;
  latitude: number;
  longitude: number;
  accuracyMeters?: number;
  accuracyGrade: 'high' | 'medium' | 'approximate';
}

export interface GeocodedPlace {
  displayName: string;
  latitude: number;
  longitude: number;
  type: string;
}

export interface OsrmRoute {
  coordinates: [number, number][]; // [lat, lon] tuples for Leaflet
  distanceMeters: number;
  durationSeconds: number;
  distanceFormatted: string;
  durationFormatted: string;
  summary?: string;
}

// Configurable Overpass endpoints with fallback mirrors
const DEFAULT_OVERPASS_URL =
  import.meta.env.VITE_OVERPASS_URL || 'https://overpass-api.de/api/interpreter';

const OVERPASS_ENDPOINTS = [
  DEFAULT_OVERPASS_URL,
  'https://overpass.kumi.systems/api/interpreter',
  'https://maps.mail.ru/osm/tools/overpass/api/interpreter',
  'https://overpass.openstreetmap.ru/api/interpreter',
].filter((v, i, a) => a.indexOf(v) === i); // remove duplicates if custom matches default

const DEFAULT_ROUTING_URL =
  import.meta.env.VITE_ROUTING_URL || 'https://router.project-osrm.org/route/v1/driving';

export class MedicalStoreService {
  // In-memory caching for query results (5 min TTL)
  private static cache = new Map<string, { timestamp: number; data: MedicalStore[] }>();
  // In-memory cache for OSRM routes
  private static routeCache = new Map<string, OsrmRoute>();

  /**
   * Request real hardware/browser GPS location with maximum precision (maximumAge: 0)
   */
  public static requestUserLocation(): Promise<UserCoordinates> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by your browser.'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          resolve({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            accuracyMeters: pos.coords.accuracy,
            altitudeMeters: pos.coords.altitude ?? undefined,
            timestamp: pos.timestamp,
          });
        },
        (err) => {
          // If high accuracy times out, fallback to fast position
          if (err.code === err.TIMEOUT) {
            navigator.geolocation.getCurrentPosition(
              (fallbackPos) => {
                resolve({
                  latitude: fallbackPos.coords.latitude,
                  longitude: fallbackPos.coords.longitude,
                  accuracyMeters: fallbackPos.coords.accuracy,
                  timestamp: fallbackPos.timestamp,
                });
              },
              () => reject(new Error('TIMEOUT')),
              { enableHighAccuracy: false, timeout: 8000, maximumAge: 0 }
            );
            return;
          }

          let message = 'Unable to retrieve location.';
          if (err.code === err.PERMISSION_DENIED) {
            message = 'PERMISSION_DENIED';
          } else if (err.code === err.POSITION_UNAVAILABLE) {
            message = 'POSITION_UNAVAILABLE';
          }
          reject(new Error(message));
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 0, // Force fresh satellite/GPS fix from hardware
        }
      );
    });
  }

  /**
   * Reverse Geocode with Deep Local Data (village, tehsil, district, state, pin code)
   */
  public static async reverseGeocodeDetails(
    lat: number,
    lon: number,
    accuracyMeters?: number
  ): Promise<LocationDetails> {
    const accuracyGrade = !accuracyMeters || accuracyMeters <= 50 ? 'high' : accuracyMeters <= 500 ? 'medium' : 'approximate';
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`;
      const res = await fetch(url, {
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!res.ok) throw new Error('Reverse geocode failed');

      const data = await res.json();
      if (!data || !data.address) throw new Error('No address data');

      const a = data.address;
      const villageOrArea = a.village || a.suburb || a.neighbourhood || a.hamlet || a.residential || a.road || '';
      const cityOrTown = a.city || a.town || a.municipality || '';
      const subDistrict = a.county || a.state_district || a.tehsil || a.subdistrict || '';
      const district = a.district || a.state_district || a.city || a.town || '';
      const state = a.state || '';
      const postcode = a.postcode || '';
      const country = a.country || 'India';

      const shortParts = [villageOrArea, cityOrTown || subDistrict, district].filter(Boolean);
      const placeName = shortParts.length > 0
        ? shortParts.join(', ')
        : (data.display_name?.split(',').slice(0, 3).join(', ') || `${lat.toFixed(4)}°, ${lon.toFixed(4)}°`);

      return {
        placeName,
        villageOrArea,
        cityOrTown,
        subDistrict,
        district,
        state,
        postcode,
        country,
        fullAddress: data.display_name || placeName,
        latitude: lat,
        longitude: lon,
        accuracyMeters,
        accuracyGrade,
      };
    } catch {
      return {
        placeName: `${lat.toFixed(4)}°, ${lon.toFixed(4)}°`,
        villageOrArea: '',
        cityOrTown: '',
        district: '',
        state: '',
        country: 'India',
        fullAddress: `${lat.toFixed(6)}, ${lon.toFixed(6)}`,
        latitude: lat,
        longitude: lon,
        accuracyMeters,
        accuracyGrade,
      };
    }
  }

  /**
   * Reverse Geocode: Convert lat/lon to human-readable place name
   */
  public static async reverseGeocode(lat: number, lon: number): Promise<string> {
    const details = await this.reverseGeocodeDetails(lat, lon);
    return details.placeName;
  }

  /**
   * Watch real-time location changes with debouncing
   */
  public static watchUserLocation(
    onLocation: (coords: UserCoordinates) => void,
    onError: (err: any) => void
  ): number | null {
    if (!navigator.geolocation) return null;

    let lastLat = 0;
    let lastLon = 0;

    return navigator.geolocation.watchPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        const distMoved = this.calculateHaversineDistance(lastLat, lastLon, lat, lon);
        if (lastLat === 0 || distMoved > 50) {
          lastLat = lat;
          lastLon = lon;
          onLocation({
            latitude: lat,
            longitude: lon,
            accuracyMeters: pos.coords.accuracy,
          });
        }
      },
      (err) => {
        onError(err);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 10000,
        timeout: 20000,
      }
    );
  }

  /**
   * Real Geocoding for manual location search (OpenStreetMap Nominatim)
   */
  public static async geocodeAddress(query: string): Promise<GeocodedPlace[]> {
    const q = query.trim();
    if (!q) return [];

    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        q
      )}&countrycodes=in&limit=6&addressdetails=1`;

      const res = await fetch(url, {
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!res.ok) return [];

      const data = await res.json();
      if (!Array.isArray(data)) return [];

      return data.map((item: any) => ({
        displayName: item.display_name,
        latitude: parseFloat(item.lat),
        longitude: parseFloat(item.lon),
        type: item.type || item.class || 'place',
      }));
    } catch (err) {
      console.warn('Geocoding search failed:', err);
      return [];
    }
  }

  /**
   * Main Search Entry Point: Queries live OpenStreetMap data for farming stores & services
   */
  public static async fetchNearbyMedicalStores(
    lat: number,
    lon: number,
    radiusMeters: number = 5000,
    searchQuery: string = '',
    category: FarmingCategory = 'all'
  ): Promise<MedicalStore[]> {
    const cacheKey = `${lat.toFixed(3)}_${lon.toFixed(3)}_${radiusMeters}_${category}_${searchQuery.trim().toLowerCase()}`;
    const cached = this.cache.get(cacheKey);
    const now = Date.now();
    if (cached && now - cached.timestamp < 300000) {
      return cached.data;
    }

    // Optional Google Places API (only used if explicitly configured by user via env variable)
    const googleApiKey = (
      import.meta.env.VITE_GOOGLE_MAPS_API_KEY ||
      import.meta.env.GOOGLE_MAPS_API_KEY ||
      ''
    ).trim();

    if (googleApiKey) {
      try {
        const gStores = await this.fetchFromGooglePlaces(lat, lon, radiusMeters, searchQuery, googleApiKey);
        if (gStores && gStores.length > 0) {
          this.cache.set(cacheKey, { timestamp: now, data: gStores });
          return gStores;
        }
      } catch (e) {
        console.warn('Google Places API failed, falling back to OpenStreetMap Overpass:', e);
      }
    }

    // Real OpenStreetMap Overpass API (Free, No Key)
    const results = await this.fetchFromOverpassAPI(lat, lon, radiusMeters, searchQuery, category);
    this.cache.set(cacheKey, { timestamp: now, data: results });
    return results;
  }

  /**
   * Build Overpass QL query with multiple specific tags per category
   */
  private static buildOverpassQuery(
    lat: number,
    lon: number,
    radiusMeters: number,
    category: FarmingCategory
  ): string {
    const r = radiusMeters;
    let statements = '';

    switch (category) {
      case 'pesticide':
        statements = `
          node["shop"="agrarian"]["agrarian"~"pesticide|chemical|crop_protection"](around:${r},${lat},${lon});
          node["name"~"pesticide|insecticide|fungicide|कीटनाशक|crop protection|agro.*chem",i](around:${r},${lat},${lon});
          node["shop"="chemist"]["name"~"krishi|agro|agri|kisan|pesticide|कीटनाशक",i](around:${r},${lat},${lon});
          way["name"~"pesticide|insecticide|fungicide|कीटनाशक|crop protection|agro.*chem",i](around:${r},${lat},${lon});
        `;
        break;

      case 'fertilizer':
        statements = `
          node["shop"="fertiliser"](around:${r},${lat},${lon});
          node["shop"="fertilizer"](around:${r},${lat},${lon});
          node["shop"="agrarian"]["fertiliser"="yes"](around:${r},${lat},${lon});
          node["name"~"fertilizer|fertiliser|खाद|खत|urea|dap|potash",i](around:${r},${lat},${lon});
          way["shop"="fertiliser"](around:${r},${lat},${lon});
          way["name"~"fertilizer|fertiliser|खाद|खत|urea|dap|potash",i](around:${r},${lat},${lon});
        `;
        break;

      case 'seeds':
        statements = `
          node["shop"="seeds"](around:${r},${lat},${lon});
          node["shop"="agrarian"]["agrarian"="seeds"](around:${r},${lat},${lon});
          node["name"~"seed|seeds|बीज|बियाणे",i](around:${r},${lat},${lon});
          way["shop"="seeds"](around:${r},${lat},${lon});
          way["name"~"seed|seeds|बीज|बियाणे",i](around:${r},${lat},${lon});
        `;
        break;

      case 'agri_input':
        statements = `
          node["shop"="agrarian"](around:${r},${lat},${lon});
          node["trade"="agricultural_supplies"](around:${r},${lat},${lon});
          node["shop"="farm"](around:${r},${lat},${lon});
          node["name"~"agri.*input|agro.*input|krishi.*input|कृषि इनपुट|agri store|agro store",i](around:${r},${lat},${lon});
          way["shop"="agrarian"](around:${r},${lat},${lon});
          way["trade"="agricultural_supplies"](around:${r},${lat},${lon});
        `;
        break;

      case 'krishi_kendra':
        statements = `
          node["name"~"krishi seva kendra|krishi kendra|kisan seva kendra|कृषि सेवा केंद्र|कृषि केंद्र|कृषी केंद्र|kisan kendra",i](around:${r},${lat},${lon});
          way["name"~"krishi seva kendra|krishi kendra|kisan seva kendra|कृषि सेवा केंद्र|कृषि केंद्र|कृषी केंद्र|kisan kendra",i](around:${r},${lat},${lon});
        `;
        break;

      case 'agri_equipment':
        statements = `
          node["shop"="agricultural_machinery"](around:${r},${lat},${lon});
          node["shop"="farm_machinery"](around:${r},${lat},${lon});
          node["trade"="agricultural_machinery"](around:${r},${lat},${lon});
          node["craft"="agricultural_engines"](around:${r},${lat},${lon});
          node["name"~"machinery|equipment|pump|spray|tiller|कृषि यंत्र|कृषी अवजारे|spray pump",i](around:${r},${lat},${lon});
          way["shop"="agricultural_machinery"](around:${r},${lat},${lon});
          way["trade"="agricultural_machinery"](around:${r},${lat},${lon});
        `;
        break;

      case 'tractor_machinery':
        statements = `
          node["shop"="tractor"](around:${r},${lat},${lon});
          node["name"~"tractor|ट्रैक्टर|mahindra tractor|sonalika|swaraj|john deere|kubota|new holland|farmtrac|powertrac|tractor spare",i](around:${r},${lat},${lon});
          way["shop"="tractor"](around:${r},${lat},${lon});
          way["name"~"tractor|ट्रैक्टर",i](around:${r},${lat},${lon});
        `;
        break;

      case 'nursery':
        statements = `
          node["shop"="garden_centre"](around:${r},${lat},${lon});
          node["shop"="nursery"](around:${r},${lat},${lon});
          node["landuse"="plant_nursery"](around:${r},${lat},${lon});
          node["name"~"nursery|plant nursery|पौधशाला|नर्सरी|कलम",i](around:${r},${lat},${lon});
          way["shop"="garden_centre"](around:${r},${lat},${lon});
          way["landuse"="plant_nursery"](around:${r},${lat},${lon});
          way["name"~"nursery|plant nursery|पौधशाला|नर्सरी",i](around:${r},${lat},${lon});
        `;
        break;

      case 'veterinary':
        statements = `
          node["amenity"="veterinary"](around:${r},${lat},${lon});
          node["healthcare"="veterinary"](around:${r},${lat},${lon});
          node["veterinary"="clinic"](around:${r},${lat},${lon});
          node["name"~"veterinary|pashu|पशु चिकित्सा|पशु अस्पताल|पशु दवा|animal hospital|pashu chikitsalay",i](around:${r},${lat},${lon});
          way["amenity"="veterinary"](around:${r},${lat},${lon});
        `;
        break;

      case 'other_services':
        statements = `
          node["amenity"="weighbridge"](around:${r},${lat},${lon});
          node["shop"="animal_feed"](around:${r},${lat},${lon});
          node["shop"="irrigation"](around:${r},${lat},${lon});
          node["trade"="irrigation"](around:${r},${lat},${lon});
          node["craft"="blacksmith"](around:${r},${lat},${lon});
          node["name"~"weighbridge|dharam kanta|धर्म कांटा|पशु आहार|cattle feed|irrigation|drip irrigation|cold storage|warehouse|mandi|krishi mandi",i](around:${r},${lat},${lon});
          way["amenity"="weighbridge"](around:${r},${lat},${lon});
          way["shop"="animal_feed"](around:${r},${lat},${lon});
        `;
        break;

      case 'medicine':
        statements = `
          node["shop"="chemist"]["name"~"krishi|agro|agri|kisan|dawa|दवा|औषध",i](around:${r},${lat},${lon});
          node["amenity"="pharmacy"]["name"~"krishi|agro|agri|kisan|dawa|दवा|veterinary|पशु",i](around:${r},${lat},${lon});
          node["name"~"agri.*medicine|krishi.*dawa|कृषि दवा|agro.*med",i](around:${r},${lat},${lon});
          way["name"~"agri.*medicine|krishi.*dawa|कृषि दवा|agro.*med",i](around:${r},${lat},${lon});
        `;
        break;

      case 'all':
      default:
        statements = `
          node["shop"="agrarian"](around:${r},${lat},${lon});
          node["shop"="farm"](around:${r},${lat},${lon});
          node["shop"="fertiliser"](around:${r},${lat},${lon});
          node["shop"="seeds"](around:${r},${lat},${lon});
          node["shop"="garden_centre"](around:${r},${lat},${lon});
          node["shop"="nursery"](around:${r},${lat},${lon});
          node["shop"="tractor"](around:${r},${lat},${lon});
          node["shop"="agricultural_machinery"](around:${r},${lat},${lon});
          node["amenity"="veterinary"](around:${r},${lat},${lon});
          node["trade"="agricultural_supplies"](around:${r},${lat},${lon});
          node["trade"="agricultural_machinery"](around:${r},${lat},${lon});
          node["craft"="agricultural_engines"](around:${r},${lat},${lon});
          node["commercial"="agricultural"](around:${r},${lat},${lon});
          node["name"~"krishi|kendra|kisan|agro|agri|seed|fertilizer|fertiliser|pesticide|machinery|tractor|nursery|veterinary|pashu|farm|कृषि|खाद|बीज|कीटनाशक|ट्रैक्टर|नर्सरी|पशु",i](around:${r},${lat},${lon});
          way["shop"="agrarian"](around:${r},${lat},${lon});
          way["shop"="fertiliser"](around:${r},${lat},${lon});
          way["shop"="seeds"](around:${r},${lat},${lon});
          way["shop"="tractor"](around:${r},${lat},${lon});
          way["shop"="agricultural_machinery"](around:${r},${lat},${lon});
          way["amenity"="veterinary"](around:${r},${lat},${lon});
          way["name"~"krishi|kendra|agro|agri|seed|fertilizer|fertiliser|pesticide|machinery|tractor|nursery|veterinary|pashu|farm|कृषि|खाद|बीज|कीटनाशक|ट्रैक्टर|नर्सरी|पशु",i](around:${r},${lat},${lon});
        `;
        break;
    }

    return `[out:json][timeout:15];
(
${statements}
);
out center tags;`;
  }

  /**
   * OpenStreetMap Overpass API Execution with mirror failover
   */
  private static async fetchFromOverpassAPI(
    lat: number,
    lon: number,
    radiusMeters: number,
    searchQuery: string,
    category: FarmingCategory
  ): Promise<MedicalStore[]> {
    const overpassQL = this.buildOverpassQuery(lat, lon, radiusMeters, category);

    // Try each Overpass mirror with a 12s timeout each
    for (const endpoint of OVERPASS_ENDPOINTS) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 12000);

        const res = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: `data=${encodeURIComponent(overpassQL)}`,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);
        if (!res.ok) continue;

        const data = await res.json();
        if (!data || !Array.isArray(data.elements)) continue;

        const results = this.parseOverpassElements(
          data.elements,
          lat,
          lon,
          searchQuery.trim().toLowerCase(),
          category
        );
        console.info(`[MedMap] Overpass returned ${results.length} stores from ${endpoint}`);
        return results;
      } catch (err: any) {
        if (err?.name === 'AbortError') {
          console.warn(`Overpass ${endpoint} timed out, trying next mirror...`);
        } else {
          console.warn(`Overpass ${endpoint} error:`, err?.message);
        }
      }
    }

    // ALL OVERPASS MIRRORS FAILED -> Fall back to Nominatim keyword search
    console.warn('[MedMap] All Overpass mirrors failed, falling back to Nominatim...');
    try {
      return await this.fetchFromNominatimFallback(lat, lon, radiusMeters, searchQuery, category);
    } catch (fallbackErr) {
      console.error('[MedMap] Nominatim fallback failed:', fallbackErr);
      throw new Error('Unable to connect to live map places servers. Please check your internet connection.');
    }
  }

  /**
   * Nominatim keyword-based fallback when Overpass mirrors are unreachable
   */
  private static async fetchFromNominatimFallback(
    lat: number,
    lon: number,
    radiusMeters: number,
    searchQuery: string,
    category: FarmingCategory
  ): Promise<MedicalStore[]> {
    const degOffset = radiusMeters / 111320; // ~degrees per meter
    const viewbox = `${lon - degOffset},${lat + degOffset},${lon + degOffset},${lat - degOffset}`;

    const categoryKeywords: Record<FarmingCategory, string[]> = {
      all: ['krishi kendra', 'agro shop', 'seed store', 'fertilizer shop', 'pesticide shop', 'kisan seva kendra', 'tractor', 'nursery', 'veterinary'],
      medicine: ['krishi dawa', 'agricultural medicine', 'veterinary medical store', 'pashu dawa'],
      pesticide: ['pesticide shop', 'insecticide', 'crop protection', 'कीटनाशक'],
      fertilizer: ['fertilizer store', 'fertiliser shop', 'खाद की दुकान', 'खत दुकान'],
      seeds: ['seed store', 'certified seeds', 'बीज भंडार', 'बियाणे दुकान'],
      agri_input: ['agri input', 'agro input store', 'krishi input', 'शेती साहित्य'],
      krishi_kendra: ['krishi seva kendra', 'krishi kendra', 'kisan seva kendra', 'कृषि सेवा केंद्र'],
      agri_equipment: ['agricultural machinery', 'farm equipment', 'spray pump', 'कृषि यंत्र'],
      tractor_machinery: ['tractor dealer', 'tractor parts', 'farm machinery', 'ट्रैक्टर'],
      nursery: ['plant nursery', 'garden centre', 'पौधशाला', 'नर्सरी'],
      veterinary: ['veterinary clinic', 'pashu chikitsalay', 'animal hospital', 'पशु चिकित्सालय'],
      other_services: ['weighbridge', 'dharam kanta', 'cattle feed', 'irrigation system', 'कृषि मंडी'],
    };

    const keywords = searchQuery ? [searchQuery] : categoryKeywords[category] || categoryKeywords.all;
    const allResults: MedicalStore[] = [];
    const seenCoords = new Set<string>();

    for (const kw of keywords.slice(0, 5)) {
      try {
        const url =
          `https://nominatim.openstreetmap.org/search` +
          `?format=json` +
          `&q=${encodeURIComponent(kw)}` +
          `&viewbox=${viewbox}` +
          `&bounded=1` +
          `&limit=15` +
          `&addressdetails=1` +
          `&extratags=1`;

        const controller = new AbortController();
        const tid = setTimeout(() => controller.abort(), 7000);

        const res = await fetch(url, {
          headers: {
            'Accept': 'application/json',
          },
          signal: controller.signal,
        });
        clearTimeout(tid);

        if (!res.ok) continue;
        const items: any[] = await res.json();
        if (!Array.isArray(items)) continue;

        for (const item of items) {
          const sLat = parseFloat(item.lat);
          const sLon = parseFloat(item.lon);
          if (isNaN(sLat) || isNaN(sLon)) continue;

          const coordKey = `${sLat.toFixed(4)}_${sLon.toFixed(4)}`;
          if (seenCoords.has(coordKey)) continue;
          seenCoords.add(coordKey);

          const distMeters = this.calculateHaversineDistance(lat, lon, sLat, sLon);
          if (distMeters > radiusMeters) continue;

          const nameRaw = item.name || item.display_name?.split(',')[0] || kw;
          const type = item.type || item.class || 'shop';
          const extra = item.extratags || {};
          const addr = item.address || {};

          const addrParts = [
            addr.road,
            addr.village || addr.suburb || addr.town || addr.city,
            addr.county || addr.district,
            addr.state,
          ].filter(Boolean);

          const assignedCategory = category !== 'all' ? category : this.categorizeStore(nameRaw, type, extra);

          allResults.push({
            id: `nom_${item.osm_id || item.place_id}`,
            name: nameRaw,
            category: assignedCategory,
            categoryKey: this.getCategoryTranslationKey(assignedCategory),
            latitude: sLat,
            longitude: sLon,
            distanceMeters: distMeters,
            distanceFormatted: this.formatDistance(distMeters),
            address: addrParts.length > 0 ? addrParts.join(', ') : (item.display_name?.split(',').slice(0, 3).join(', ') || 'OpenStreetMap Verified Location'),
            source: 'osm',
            rawTags: extra,
          });
        }
      } catch (e: any) {
        if (e?.name !== 'AbortError') {
          console.warn(`Nominatim search failed for "${kw}":`, e?.message);
        }
      }
    }

    return allResults.sort((a, b) => a.distanceMeters - b.distanceMeters);
  }

  /**
   * Parse and structure raw OSM Overpass elements into verified MedicalStore records
   */
  private static parseOverpassElements(
    elements: any[],
    userLat: number,
    userLon: number,
    filterQuery: string,
    forcedCategory: FarmingCategory
  ): MedicalStore[] {
    const stores: MedicalStore[] = [];
    const seenIds = new Set<string>();

    for (const el of elements) {
      const tags = el.tags || {};
      const storeLat = el.lat || el.center?.lat;
      const storeLon = el.lon || el.center?.lon;

      if (!storeLat || !storeLon) continue;

      const coordKey = `${storeLat.toFixed(5)}_${storeLon.toFixed(5)}`;
      if (seenIds.has(coordKey)) continue;
      seenIds.add(coordKey);

      const rawName = tags.name || tags['name:en'] || tags['name:hi'] || tags['name:mr'] || '';
      const shopType = tags.shop || tags.amenity || tags.commercial || tags.trade || '';

      const detectedCategory = this.categorizeStore(rawName, shopType, tags);
      const category: FarmingCategory = forcedCategory !== 'all' ? forcedCategory : detectedCategory;
      const name = rawName || this.getDefaultNameForCategory(category, shopType);

      if (filterQuery) {
        const fullText = `${name} ${category} ${shopType} ${tags['addr:city'] || ''} ${tags['addr:street'] || ''} ${tags['addr:village'] || ''}`.toLowerCase();
        if (!fullText.includes(filterQuery)) {
          continue;
        }
      }

      const distanceMeters = this.calculateHaversineDistance(userLat, userLon, storeLat, storeLon);

      const addressParts = [
        tags['addr:housenumber'] ? `#${tags['addr:housenumber']}` : null,
        tags['addr:street'],
        tags['addr:suburb'] || tags['addr:neighbourhood'],
        tags['addr:village'] || tags['addr:city'] || tags['addr:town'],
        tags['addr:district'],
        tags['addr:state'],
        tags['addr:postcode'],
      ].filter(Boolean);

      const address = addressParts.length > 0
        ? addressParts.join(', ')
        : tags['addr:full'] || 'OpenStreetMap Verified Location';

      const phone = tags.phone || tags['contact:phone'] || tags['phone:mobile'] || undefined;
      const website = tags.website || tags['contact:website'] || undefined;
      const openingHours = tags.opening_hours || undefined;

      stores.push({
        id: `osm_${el.id}`,
        name,
        category,
        categoryKey: this.getCategoryTranslationKey(category),
        latitude: storeLat,
        longitude: storeLon,
        distanceMeters,
        distanceFormatted: this.formatDistance(distanceMeters),
        address,
        phone,
        website,
        openingHours,
        isOpen: openingHours ? true : undefined,
        source: 'osm',
        rawTags: tags,
      });
    }

    return stores.sort((a, b) => a.distanceMeters - b.distanceMeters);
  }

  /**
   * Helper: Categorize store based on real OpenStreetMap tags & multi-lingual terms
   */
  public static categorizeStore(
    name: string,
    shopType: string,
    tags: Record<string, string>
  ): FarmingCategory {
    const combined = `${name} ${shopType} ${Object.values(tags).join(' ')}`.toLowerCase();

    if (
      combined.includes('tractor') ||
      combined.includes('ट्रैक्टर') ||
      shopType === 'tractor'
    ) {
      return 'tractor_machinery';
    }
    if (
      combined.includes('machinery') ||
      combined.includes('equipment') ||
      combined.includes('यंत्र') ||
      combined.includes('अवजारे') ||
      combined.includes('spray pump') ||
      shopType === 'agricultural_machinery' ||
      shopType === 'farm_machinery' ||
      tags.trade === 'agricultural_machinery' ||
      tags.craft === 'agricultural_engines'
    ) {
      return 'agri_equipment';
    }
    if (
      combined.includes('veterinary') ||
      combined.includes('pashu') ||
      combined.includes('पशु') ||
      tags.amenity === 'veterinary' ||
      tags.healthcare === 'veterinary' ||
      tags.veterinary === 'clinic'
    ) {
      return 'veterinary';
    }
    if (
      combined.includes('nursery') ||
      combined.includes('plant nursery') ||
      combined.includes('पौधशाला') ||
      combined.includes('नर्सरी') ||
      shopType === 'garden_centre' ||
      shopType === 'nursery' ||
      tags.landuse === 'plant_nursery'
    ) {
      return 'nursery';
    }
    if (
      combined.includes('krishi seva kendra') ||
      combined.includes('krishi kendra') ||
      combined.includes('kisan seva kendra') ||
      combined.includes('कृषि सेवा केंद्र') ||
      combined.includes('कृषि केंद्र') ||
      combined.includes('कृषी केंद्र') ||
      combined.includes('kisan kendra')
    ) {
      return 'krishi_kendra';
    }
    if (
      combined.includes('pesticide') ||
      combined.includes('insecticide') ||
      combined.includes('कीटनाशक') ||
      combined.includes('कीटकनाशक') ||
      combined.includes('fungicide') ||
      tags.agrarian === 'pesticide'
    ) {
      return 'pesticide';
    }
    if (
      combined.includes('fertilizer') ||
      combined.includes('fertiliser') ||
      combined.includes('खाद') ||
      combined.includes('खत') ||
      combined.includes('urea') ||
      combined.includes('dap') ||
      shopType === 'fertiliser' ||
      shopType === 'fertilizer' ||
      tags.fertiliser === 'yes'
    ) {
      return 'fertilizer';
    }
    if (
      combined.includes('seed') ||
      combined.includes('बीज') ||
      combined.includes('बियाणे') ||
      shopType === 'seeds' ||
      tags.agrarian === 'seeds'
    ) {
      return 'seeds';
    }
    if (
      combined.includes('dawa') ||
      combined.includes('medicine') ||
      combined.includes('औषध') ||
      (shopType === 'chemist' && (combined.includes('krishi') || combined.includes('agro'))) ||
      (shopType === 'pharmacy' && (combined.includes('krishi') || combined.includes('agro')))
    ) {
      return 'medicine';
    }
    if (
      combined.includes('weighbridge') ||
      combined.includes('dharam kanta') ||
      combined.includes('irrigation') ||
      combined.includes('cattle feed') ||
      combined.includes('पशु आहार') ||
      shopType === 'animal_feed' ||
      tags.amenity === 'weighbridge'
    ) {
      return 'other_services';
    }

    return 'agri_input';
  }

  public static getDefaultNameForCategory(category: FarmingCategory, shopType: string): string {
    switch (category) {
      case 'krishi_kendra': return 'Krishi Seva Kendra';
      case 'pesticide': return 'Crop Protection & Pesticide Store';
      case 'fertilizer': return 'Fertilizer & Nutrient Store';
      case 'seeds': return 'Certified Seed Store';
      case 'medicine': return 'Agricultural Medicine Store';
      case 'agri_equipment': return 'Agri Equipment & Machinery Dealer';
      case 'tractor_machinery': return 'Tractor & Machinery Store';
      case 'nursery': return 'Plant Nursery & Saplings';
      case 'veterinary': return 'Veterinary & Animal Care Clinic';
      case 'other_services': return 'Farming Support Service';
      case 'agri_input':
      default:
        return shopType ? `Agri-Input Store (${shopType})` : 'Agri-Input Store';
    }
  }

  public static getCategoryTranslationKey(category: FarmingCategory): string {
    switch (category) {
      case 'medicine': return 'med_category_medicine';
      case 'pesticide': return 'med_category_pesticide';
      case 'fertilizer': return 'med_category_fertilizer';
      case 'seeds': return 'med_category_seeds';
      case 'agri_input': return 'med_category_agri_input';
      case 'krishi_kendra': return 'med_category_krishi_kendra';
      case 'agri_equipment': return 'med_category_agri_equipment';
      case 'tractor_machinery': return 'med_category_tractor_machinery';
      case 'nursery': return 'med_category_nursery';
      case 'veterinary': return 'med_category_veterinary';
      case 'other_services': return 'med_category_other_services';
      case 'all':
      default:
        return 'med_category_all';
    }
  }

  /**
   * Free & Open Turn-by-Turn Routing via OSRM (100% Free - No API Key)
   */
  public static async getOsrmRoute(
    startLat: number,
    startLon: number,
    endLat: number,
    endLon: number
  ): Promise<OsrmRoute | null> {
    const routeKey = `${startLat.toFixed(4)},${startLon.toFixed(4)}->${endLat.toFixed(4)},${endLon.toFixed(4)}`;
    if (this.routeCache.has(routeKey)) {
      return this.routeCache.get(routeKey)!;
    }

    try {
      const url = `${DEFAULT_ROUTING_URL}/${startLon},${startLat};${endLon},${endLat}?overview=full&geometries=geojson`;
      const res = await fetch(url, {
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!res.ok) return null;
      const data = await res.json();
      if (data.code !== 'Ok' || !Array.isArray(data.routes) || data.routes.length === 0) {
        return null;
      }

      const primary = data.routes[0];
      const rawCoords: [number, number][] = primary.geometry.coordinates; // [lon, lat]
      // Map to Leaflet [lat, lon]
      const leafletCoords: [number, number][] = rawCoords.map(([lon, lat]) => [lat, lon]);

      const distM = Math.round(primary.distance);
      const durS = Math.round(primary.duration);

      const mins = Math.max(1, Math.round(durS / 60));
      const hours = Math.floor(mins / 60);
      const remMins = mins % 60;
      const durationFormatted = hours > 0 ? `${hours} hr ${remMins} min` : `${mins} min`;

      const route: OsrmRoute = {
        coordinates: leafletCoords,
        distanceMeters: distM,
        durationSeconds: durS,
        distanceFormatted: this.formatDistance(distM),
        durationFormatted,
        summary: primary.legs?.[0]?.summary || '',
      };

      this.routeCache.set(routeKey, route);
      return route;
    } catch (err) {
      console.warn('OSRM routing fetch failed:', err);
      return null;
    }
  }

  /**
   * Free OpenStreetMap Direct Navigation URL
   */
  public static getOsmDirectionsUrl(
    userLat: number,
    userLon: number,
    destLat: number,
    destLon: number
  ): string {
    return `https://www.openstreetmap.org/directions?engine=fossgis_osrm_car&route=${userLat}%2C${userLon}%3B${destLat}%2C${destLon}`;
  }

  /**
   * Google Maps Navigation URL fallback
   */
  public static getDirectionsUrl(lat: number, lon: number, storeName?: string): string {
    const encodedName = storeName ? encodeURIComponent(storeName) : '';
    return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}${
      encodedName ? `&destination_place_name=${encodedName}` : ''
    }&travelmode=driving`;
  }

  /**
   * Optional Google Places API integration (if user explicitly supplies an API key)
   */
  private static async fetchFromGooglePlaces(
    lat: number,
    lon: number,
    radius: number,
    query: string,
    apiKey: string
  ): Promise<MedicalStore[]> {
    const keyword = query || 'agricultural medicine pesticide fertilizer seed krishi kendra';
    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lon}&radius=${radius}&keyword=${encodeURIComponent(
      keyword
    )}&key=${apiKey}`;

    const res = await fetch(url);
    if (!res.ok) return [];

    const json = await res.json();
    if (!json || !Array.isArray(json.results)) return [];

    return json.results.map((r: any) => {
      const distance = this.calculateHaversineDistance(lat, lon, r.geometry.location.lat, r.geometry.location.lng);
      const cat = this.categorizeStore(r.name, r.types?.join(' ') || '', {});
      return {
        id: `g_${r.place_id}`,
        name: r.name,
        category: cat,
        categoryKey: this.getCategoryTranslationKey(cat),
        latitude: r.geometry.location.lat,
        longitude: r.geometry.location.lng,
        distanceMeters: distance,
        distanceFormatted: this.formatDistance(distance),
        address: r.vicinity || 'Verified Google Place Location',
        rating: r.rating,
        isOpen: r.opening_hours?.open_now,
        source: 'google',
      };
    });
  }

  /**
   * Accurate Haversine Distance Formula in meters
   */
  public static calculateHaversineDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    if (lat1 === lat2 && lon1 === lon2) return 0;
    const R = 6371000;
    const toRad = (x: number) => (x * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c);
  }

  /**
   * Format meters to human readable distance
   */
  public static formatDistance(meters: number): string {
    if (meters < 1000) {
      return `${meters} m`;
    }
    return `${(meters / 1000).toFixed(1)} km`;
  }

  /**
   * Local Favorites Management
   */
  public static getSavedStoreIds(): string[] {
    try {
      const data = localStorage.getItem('kisansarthi_saved_stores');
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  public static toggleSavedStore(storeId: string): boolean {
    try {
      const saved = this.getSavedStoreIds();
      const idx = saved.indexOf(storeId);
      if (idx >= 0) {
        saved.splice(idx, 1);
        localStorage.setItem('kisansarthi_saved_stores', JSON.stringify(saved));
        return false;
      } else {
        saved.push(storeId);
        localStorage.setItem('kisansarthi_saved_stores', JSON.stringify(saved));
        return true;
      }
    } catch {
      return false;
    }
  }
}
