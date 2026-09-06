import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  MapPin, Search, Navigation, AlertCircle, Phone, Globe, 
  Bookmark, BookmarkCheck, RefreshCw, X, ArrowUpRight,
  Sparkles, ChevronRight, Store, Clock, Route as RouteIcon, Car,
  Crosshair, ShieldCheck, Compass
} from 'lucide-react';
import { useLang } from '@/lib/LanguageContext';
import { useFarmContext } from '@/contexts/FarmContext';
import { 
  MedicalStoreService, 
  type MedicalStore, 
  type UserCoordinates,
  type GeocodedPlace,
  type FarmingCategory,
  type OsrmRoute,
  type LocationDetails
} from '@/services/MedicalStoreService';
import LeafletMapView from './LeafletMapView';
import VoiceMicButton from './VoiceMicButton';

const RADIUS_OPTIONS = [
  { label: '2 km', value: 2000 },
  { label: '5 km', value: 5000 },
  { label: '10 km', value: 10000 },
  { label: '20 km', value: 20000 },
];

const CATEGORY_FILTERS: Array<{ id: FarmingCategory; key: string; icon: string }> = [
  { id: 'all', key: 'med_category_all', icon: '🏪' },
  { id: 'pesticide', key: 'med_category_pesticide', icon: '🛡️' },
  { id: 'fertilizer', key: 'med_category_fertilizer', icon: '🧪' },
  { id: 'seeds', key: 'med_category_seeds', icon: '🌾' },
  { id: 'agri_input', key: 'med_category_agri_input', icon: '🌱' },
  { id: 'krishi_kendra', key: 'med_category_krishi_kendra', icon: '🏢' },
  { id: 'agri_equipment', key: 'med_category_agri_equipment', icon: '⚙️' },
  { id: 'tractor_machinery', key: 'med_category_tractor_machinery', icon: '🚜' },
  { id: 'nursery', key: 'med_category_nursery', icon: '🪴' },
  { id: 'veterinary', key: 'med_category_veterinary', icon: '🐾' },
  { id: 'other_services', key: 'med_category_other_services', icon: '⚖️' },
];

export default function MedicalMapSection() {
  const { lang, t } = useLang();
  const { activeFarm, activeLocation } = useFarmContext();

  // Coordinates, Permission & Deep Location Details State
  const [userCoords, setUserCoords] = useState<UserCoordinates | null>(null);
  const [locationDetails, setLocationDetails] = useState<LocationDetails | null>(null);
  const [locationStatus, setLocationStatus] = useState<'prompt' | 'granted' | 'denied' | 'unavailable'>('prompt');
  const [isLocating, setIsLocating] = useState(false);
  const [placeName, setPlaceName] = useState<string>('');
  const [showFullLocationData, setShowFullLocationData] = useState(true);

  // Manual Location Search State
  const [manualQuery, setManualQuery] = useState('');
  const [manualSuggestions, setManualSuggestions] = useState<GeocodedPlace[]>([]);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [showManualSearch, setShowManualSearch] = useState(false);

  // Query & Filters (Default 5 km radius)
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRadius, setSelectedRadius] = useState<number>(5000);
  const [selectedCategory, setSelectedCategory] = useState<FarmingCategory>('all');

  // Stores Data State
  const [stores, setStores] = useState<MedicalStore[]>([]);
  const [isLoadingStores, setIsLoadingStores] = useState(false);
  const [storeError, setStoreError] = useState<string | null>(null);
  const [selectedStore, setSelectedStore] = useState<MedicalStore | null>(null);

  // Free OSRM Routing State
  const [activeRoute, setActiveRoute] = useState<OsrmRoute | null>(null);
  const [isLoadingRoute, setIsLoadingRoute] = useState(false);

  // Saved / Favorite Stores
  const [savedIds, setSavedIds] = useState<string[]>(() => MedicalStoreService.getSavedStoreIds());
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const searchDebounceRef = useRef<NodeJS.Timeout | null>(null);
  const toastTimerRef = useRef<NodeJS.Timeout | null>(null);
  const storeListRef = useRef<HTMLDivElement>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToastMessage(null), 3000);
  };

  // 1. High-Accuracy Location Resolution (Fresh hardware satellite GPS fix)
  const detectLocation = useCallback(async () => {
    setIsLocating(true);
    setLocationStatus('prompt');

    try {
      const coords = await MedicalStoreService.requestUserLocation();
      setUserCoords(coords);
      setLocationStatus('granted');
      setShowManualSearch(false);

      // Deep Reverse Geocode to obtain Village, Tehsil, District, State, PIN Code
      MedicalStoreService.reverseGeocodeDetails(coords.latitude, coords.longitude, coords.accuracyMeters)
        .then((details) => {
          setLocationDetails(details);
          if (details.placeName) setPlaceName(details.placeName);
        })
        .catch(() => {});
    } catch (err: any) {
      console.warn('GPS location detection failed:', err);
      if (err.message === 'PERMISSION_DENIED') {
        setLocationStatus('denied');
      } else {
        setLocationStatus('unavailable');
      }

      // Smooth fallback to activeFarm or activeLocation
      if (activeFarm?.latitude && activeFarm?.longitude) {
        const fallbackCoords: UserCoordinates = {
          latitude: activeFarm.latitude,
          longitude: activeFarm.longitude,
          accuracyMeters: 5000,
        };
        setUserCoords(fallbackCoords);
        MedicalStoreService.reverseGeocodeDetails(activeFarm.latitude, activeFarm.longitude, 5000)
          .then((details) => {
            setLocationDetails(details);
            if (details.placeName) setPlaceName(details.placeName);
          })
          .catch(() => {});
      } else if (activeLocation?.latitude && activeLocation?.longitude) {
        const fallbackCoords: UserCoordinates = {
          latitude: activeLocation.latitude,
          longitude: activeLocation.longitude,
          accuracyMeters: 5000,
        };
        setUserCoords(fallbackCoords);
        MedicalStoreService.reverseGeocodeDetails(activeLocation.latitude, activeLocation.longitude, 5000)
          .then((details) => {
            setLocationDetails(details);
            if (details.placeName) setPlaceName(details.placeName);
          })
          .catch(() => {});
      }
    } finally {
      setIsLocating(false);
    }
  }, [activeFarm, activeLocation]);

  useEffect(() => {
    detectLocation();
  }, [detectLocation]);

  // 2. Fetch Real Stores when coordinates, radius, category, or search query changes
  const fetchStores = useCallback(
    async (coords: UserCoordinates, radius: number, query: string, category: FarmingCategory) => {
      setIsLoadingStores(true);
      setStoreError(null);

      try {
        const results = await MedicalStoreService.fetchNearbyMedicalStores(
          coords.latitude,
          coords.longitude,
          radius,
          query,
          category
        );
        setStores(results);
      } catch (err: any) {
        console.error('Failed to fetch stores:', err);
        setStoreError(err.message || t('med_try_again'));
        setStores([]);
      } finally {
        setIsLoadingStores(false);
      }
    },
    [t]
  );

  useEffect(() => {
    if (!userCoords) return;

    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(() => {
      fetchStores(userCoords, selectedRadius, searchQuery, selectedCategory);
    }, 400);

    return () => {
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    };
  }, [userCoords, selectedRadius, searchQuery, selectedCategory, fetchStores]);

  // 3. Filter stores client-side if needed
  const filteredStores = stores.filter((s) => {
    if (selectedCategory === 'all') return true;
    return s.category === selectedCategory;
  });

  // 4. Request OSRM Turn-by-Turn Route
  const handleRequestRoute = async (store: MedicalStore) => {
    if (!userCoords) {
      showToast(lang === 'hi' ? 'कृपया पहले अपना स्थान चुनें' : 'Please enable your location first');
      return;
    }

    setIsLoadingRoute(true);
    setSelectedStore(store);

    try {
      const route = await MedicalStoreService.getOsrmRoute(
        userCoords.latitude,
        userCoords.longitude,
        store.latitude,
        store.longitude
      );

      if (route) {
        setActiveRoute(route);
        showToast(`🚗 ${route.durationFormatted} (${route.distanceFormatted})`);
      } else {
        showToast(lang === 'hi' ? 'मार्ग नहीं मिल सका' : 'Route could not be calculated');
      }
    } catch {
      showToast(lang === 'hi' ? 'मार्ग लोड विफल' : 'Route calculation failed');
    } finally {
      setIsLoadingRoute(false);
    }
  };

  const handleClearRoute = () => {
    setActiveRoute(null);
  };

  // 5. Handle Manual Location Geocoding Search
  const handleManualSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualQuery.trim()) return;

    setIsGeocoding(true);
    try {
      const places = await MedicalStoreService.geocodeAddress(manualQuery);
      setManualSuggestions(places);
      if (places.length > 0) {
        const first = places[0];
        setUserCoords({
          latitude: first.latitude,
          longitude: first.longitude,
          accuracyMeters: 2000,
        });
        setLocationStatus('granted');
        setShowManualSearch(false);
        setManualSuggestions([]);

        MedicalStoreService.reverseGeocodeDetails(first.latitude, first.longitude, 2000)
          .then((details) => {
            setLocationDetails(details);
            setPlaceName(details.placeName);
          })
          .catch(() => {});

        showToast(`📍 ${first.displayName.split(',')[0]}`);
      } else {
        showToast(lang === 'hi' ? 'स्थान नहीं मिला, कृपया पुनः प्रयास करें' : 'Place not found. Please try another city or PIN code.');
      }
    } catch {
      showToast(lang === 'hi' ? 'खोज विफल रही' : 'Geocoding failed');
    } finally {
      setIsGeocoding(false);
    }
  };

  const handleSelectSuggestion = (place: GeocodedPlace) => {
    setUserCoords({
      latitude: place.latitude,
      longitude: place.longitude,
      accuracyMeters: 2000,
    });
    setLocationStatus('granted');
    setShowManualSearch(false);
    setManualSuggestions([]);
    setManualQuery('');

    MedicalStoreService.reverseGeocodeDetails(place.latitude, place.longitude, 2000)
      .then((details) => {
        setLocationDetails(details);
        setPlaceName(details.placeName);
      })
      .catch(() => {});

    showToast(`📍 ${place.displayName.split(',')[0]}`);
  };

  // 6. Toggle Bookmark / Favorite Store
  const handleToggleBookmark = (e: React.MouseEvent, storeId: string) => {
    e.stopPropagation();
    const isNowSaved = MedicalStoreService.toggleSavedStore(storeId);
    setSavedIds(MedicalStoreService.getSavedStoreIds());
    showToast(isNowSaved ? t('med_saved_success') : (lang === 'hi' ? 'हटा दिया गया' : 'Removed from saved'));
  };

  // 7. Select Store & Scroll Into View
  const handleSelectStore = (store: MedicalStore) => {
    setSelectedStore(store);
    const el = document.getElementById(`store-card-${store.id}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200 pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 px-4 py-2.5 rounded-2xl bg-stone-900/95 text-white text-xs font-bold shadow-xl border border-stone-700 animate-in slide-in-from-top-3 flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* =================================================================== */}
      {/* 1. TOP HEADER & SEARCH HERO BAR                                    */}
      {/* =================================================================== */}
      <div className="bg-gradient-to-br from-emerald-950 via-teal-950 to-stone-950 rounded-3xl p-5 sm:p-7 text-white shadow-xl relative overflow-hidden border border-emerald-800/30 space-y-4">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300">
                <Store className="w-5 h-5 stroke-[2.4]" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
                  <span>{t('med_title')}</span>
                  <span className="bg-emerald-500 text-emerald-950 text-[10px] font-black uppercase px-2 py-0.5 rounded-md">
                    LIVE
                  </span>
                </h1>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-emerald-200/80 font-medium mt-1">
              {t('med_subtitle')}
            </p>
          </div>

          {/* Current Location Quick Button */}
          {userCoords && (
            <div className="flex items-center gap-2 self-start sm:self-auto bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/15 text-[11px] font-bold text-emerald-100 max-w-[280px]">
              <MapPin className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
              <span className="truncate">
                {placeName || `${userCoords.latitude.toFixed(4)}°, ${userCoords.longitude.toFixed(4)}°`}
              </span>
              <button
                onClick={detectLocation}
                disabled={isLocating}
                className="hover:text-white transition-colors ml-1 p-0.5 flex-shrink-0"
                title="Refresh accurate GPS location"
              >
                <RefreshCw className={`w-3 h-3 ${isLocating ? 'animate-spin' : ''}`} />
              </button>
            </div>
          )}
        </div>

        {/* ================================================================= */}
        {/* DETAILED ACCURATE CURRENT LOCATION DATA PANEL                    */}
        {/* ================================================================= */}
        {userCoords && (
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3.5 border border-white/15 text-white shadow-inner">
            <div className="flex items-center justify-between flex-wrap gap-2 pb-2.5 border-b border-white/10">
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
                <span className="text-xs font-black text-emerald-200 truncate">
                  📍 {locationDetails?.placeName || placeName || 'GPS Location Locked'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md bg-emerald-500/25 border border-emerald-400/30 text-emerald-300 font-extrabold text-[10px] flex items-center gap-1">
                  <Crosshair className="w-3 h-3" />
                  <span>सटीकता: ±{Math.round(userCoords.accuracyMeters || 10)}m</span>
                </span>
                <button
                  type="button"
                  onClick={detectLocation}
                  disabled={isLocating}
                  className="px-2 py-0.5 rounded-md bg-white/10 hover:bg-white/20 text-emerald-200 text-[10px] font-bold transition-colors flex items-center gap-1"
                >
                  <RefreshCw className={`w-2.5 h-2.5 ${isLocating ? 'animate-spin' : ''}`} />
                  <span>ताज़ा करें (GPS)</span>
                </button>
              </div>
            </div>

            {/* Structured Location Metadata Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2.5 text-[11px]">
              <div className="bg-black/20 p-2 rounded-xl border border-white/5">
                <div className="text-[10px] font-bold text-emerald-300/70 uppercase">क्षेत्र / Village</div>
                <div className="font-extrabold text-white truncate mt-0.5">
                  {locationDetails?.villageOrArea || locationDetails?.cityOrTown || 'ग्रामीण क्षेत्र'}
                </div>
              </div>

              <div className="bg-black/20 p-2 rounded-xl border border-white/5">
                <div className="text-[10px] font-bold text-emerald-300/70 uppercase">जिला व राज्य / District</div>
                <div className="font-extrabold text-white truncate mt-0.5">
                  {locationDetails?.district ? `${locationDetails.district}, ${locationDetails.state || ''}` : 'महाराष्ट्र (Maharashtra)'}
                </div>
              </div>

              <div className="bg-black/20 p-2 rounded-xl border border-white/5">
                <div className="text-[10px] font-bold text-emerald-300/70 uppercase">पिन कोड / PIN Code</div>
                <div className="font-extrabold text-emerald-300 truncate mt-0.5">
                  {locationDetails?.postcode || 'उपलब्ध'}
                </div>
              </div>

              <div className="bg-black/20 p-2 rounded-xl border border-white/5">
                <div className="text-[10px] font-bold text-emerald-300/70 uppercase">सटीक कॉर्डिनेट्स / GPS</div>
                <div className="font-mono font-bold text-emerald-100 text-[10px] truncate mt-0.5">
                  {userCoords.latitude.toFixed(5)}°, {userCoords.longitude.toFixed(5)}°
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Prominent Search Bar with Voice Typing */}
        <div className="flex items-center gap-2 bg-white/95 backdrop-blur-md p-2 rounded-2xl border border-white/30 shadow-md">
          <Search className="w-5 h-5 text-stone-400 ml-2 flex-shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('med_search_placeholder')}
            className="flex-1 bg-transparent px-2 py-1 text-xs sm:text-sm font-bold text-stone-900 placeholder:text-stone-400 focus:outline-none"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="p-1 rounded-lg text-stone-400 hover:text-stone-700"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          {/* Voice Mic Button */}
          <VoiceMicButton
            currentValue={searchQuery}
            onTranscript={(text) => setSearchQuery(text)}
            className="h-10 w-10 rounded-xl"
            iconSize={18}
          />
        </div>

        {/* Radius Filter Pills: 2 km, 5 km, 10 km, 20 km */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            <span className="text-[11px] font-bold text-emerald-300 mr-1 flex items-center gap-1">
              <Navigation className="w-3 h-3" />
              {t('med_radius')}:
            </span>
            {RADIUS_OPTIONS.map((r) => (
              <button
                key={r.value}
                type="button"
                onClick={() => setSelectedRadius(r.value)}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  selectedRadius === r.value
                    ? 'bg-emerald-500 text-emerald-950 shadow-md font-black scale-105'
                    : 'bg-white/10 hover:bg-white/20 text-emerald-100 border border-white/10'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>

          {/* Manual Location Search Toggle */}
          <button
            type="button"
            onClick={() => setShowManualSearch(!showManualSearch)}
            className="text-xs font-bold text-emerald-300 hover:text-white underline underline-offset-4 flex items-center gap-1 transition-colors whitespace-nowrap"
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>{t('med_search_manually')}</span>
          </button>
        </div>

      </div>

      {/* =================================================================== */}
      {/* 2. LOCATION PERMISSION / MANUAL SEARCH NOTICE BANNER                */}
      {/* =================================================================== */}
      {locationStatus === 'denied' && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-black">{t('med_location_permission_required')}</div>
              <div className="text-[11px] text-amber-800 mt-0.5">{t('med_permission_denied_desc')}</div>
            </div>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={() => setShowManualSearch(true)}
              className="px-3 py-1.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold transition-colors"
            >
              {t('med_search_manually')}
            </button>
            <button
              onClick={detectLocation}
              className="px-3 py-1.5 rounded-xl bg-white hover:bg-stone-50 border border-amber-300 text-amber-900 text-xs font-bold transition-colors"
            >
              {t('med_try_again')}
            </button>
          </div>
        </div>
      )}

      {/* Manual Location Search Form */}
      {showManualSearch && (
        <div className="p-4 sm:p-5 rounded-3xl bg-white border border-stone-200 shadow-sm space-y-3 animate-in slide-in-from-top-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs sm:text-sm font-black text-stone-900 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-700" />
              <span>{t('med_enter_city')}</span>
            </h3>
            <button
              onClick={() => setShowManualSearch(false)}
              className="text-stone-400 hover:text-stone-600 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleManualSearch} className="flex gap-2">
            <input
              type="text"
              value={manualQuery}
              onChange={(e) => setManualQuery(e.target.value)}
              placeholder="e.g. Pune, Baramati, Nashik, Wardha, or 413102"
              className="flex-1 px-4 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs font-bold text-stone-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
            <button
              type="submit"
              disabled={isGeocoding || !manualQuery.trim()}
              className="px-4 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold transition-all disabled:opacity-50"
            >
              {isGeocoding ? '...' : t('med_search_btn')}
            </button>
          </form>

          {manualSuggestions.length > 0 && (
            <div className="space-y-1.5 pt-2 border-t border-stone-100">
              <div className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">Select Location:</div>
              {manualSuggestions.map((place, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectSuggestion(place)}
                  className="w-full text-left p-2.5 rounded-xl hover:bg-emerald-50 text-xs text-stone-800 font-bold border border-transparent hover:border-emerald-200 transition-colors flex items-center justify-between"
                >
                  <span className="truncate">{place.displayName}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-stone-400 flex-shrink-0" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* =================================================================== */}
      {/* 3. 10 CATEGORY FILTER TABS                                          */}
      {/* =================================================================== */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs select-none scrollbar-none">
        {CATEGORY_FILTERS.map((cat) => {
          const isActive = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-2 rounded-2xl font-bold transition-all flex items-center gap-1.5 whitespace-nowrap border ${
                isActive
                  ? 'bg-emerald-800 text-white border-emerald-800 shadow-sm font-black scale-[1.02]'
                  : 'bg-white hover:bg-emerald-50 text-stone-700 border-stone-200 hover:border-emerald-200'
              }`}
            >
              <span className="text-sm">{cat.icon}</span>
              <span>{t(cat.key) || cat.id}</span>
            </button>
          );
        })}
      </div>

      {/* =================================================================== */}
      {/* 4. MAIN MAP & STORES SPLIT INTERFACE                                */}
      {/* =================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* LEFT COLUMN: INTERACTIVE LEAFLET MAP (7 COLS ON DESKTOP) */}
        <div className="lg:col-span-7 h-[430px] lg:h-[620px] sticky top-20 rounded-3xl overflow-hidden border border-stone-200/90 shadow-sm bg-stone-100">
          <LeafletMapView
            userCoords={userCoords}
            locationDetails={locationDetails}
            stores={filteredStores}
            selectedStore={selectedStore}
            onSelectStore={handleSelectStore}
            onLocateMe={detectLocation}
            isLocating={isLocating}
            placeName={placeName}
            activeRoute={activeRoute}
            onClearRoute={handleClearRoute}
            onRequestRoute={handleRequestRoute}
            isLoadingRoute={isLoadingRoute}
          />
        </div>

        {/* RIGHT COLUMN: REAL STORE CARDS LIST (5 COLS ON DESKTOP) */}
        <div ref={storeListRef} className="lg:col-span-5 space-y-3.5 max-h-[620px] overflow-y-auto pr-1">
          
          {/* Header Count Strip */}
          <div className="flex items-center justify-between px-1 py-1">
            <div className="text-xs font-black text-stone-900 flex items-center gap-2">
              <span>{t('med_nearby_stores')}</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 text-[11px] font-black">
                {filteredStores.length}
              </span>
            </div>
            {isLoadingStores && (
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-800 animate-pulse">
                <RefreshCw className="w-3 h-3 animate-spin" />
                <span>{t('med_loading_stores')}</span>
              </div>
            )}
          </div>

          {/* Loading Skeleton */}
          {isLoadingStores && stores.length === 0 && (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-4 rounded-3xl bg-white border border-stone-200 animate-pulse space-y-3">
                  <div className="h-4 bg-stone-200 rounded-lg w-2/3" />
                  <div className="h-3 bg-stone-100 rounded-lg w-1/2" />
                  <div className="h-8 bg-stone-100 rounded-xl w-full" />
                </div>
              ))}
            </div>
          )}

          {/* Error State */}
          {storeError && (
            <div className="p-5 rounded-3xl bg-rose-50 border border-rose-200 text-rose-950 space-y-2 text-center">
              <AlertCircle className="w-6 h-6 text-rose-700 mx-auto" />
              <div className="text-xs font-black">{storeError}</div>
              <button
                type="button"
                onClick={() => userCoords && fetchStores(userCoords, selectedRadius, searchQuery, selectedCategory)}
                className="px-4 py-2 rounded-xl bg-rose-700 text-white text-xs font-bold hover:bg-rose-800 transition-colors inline-block"
              >
                {t('med_try_again')}
              </button>
            </div>
          )}

          {/* Zero Results State with Required Helpful Message */}
          {!isLoadingStores && !storeError && filteredStores.length === 0 && (
            <div className="p-6 rounded-3xl bg-white border border-stone-200 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-stone-100 text-stone-500 flex items-center justify-center mx-auto text-2xl">
                🌾
              </div>
              <div className="text-xs font-black text-stone-800">
                {t('med_no_stores_found')}
              </div>
              <p className="text-[11px] text-stone-500 font-medium">
                {lang === 'hi' 
                  ? 'वर्तमान दायरे में कोई केंद्र नहीं मिला। खोज का दायरा 10 किमी या 20 किमी तक बढ़ाएं।'
                  : 'No farming-related stores found within this radius. Try increasing the search radius.'}
              </p>
              {selectedRadius < 20000 && (
                <button
                  type="button"
                  onClick={() => setSelectedRadius(selectedRadius === 5000 ? 10000 : 20000)}
                  className="px-4 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold transition-colors inline-flex items-center gap-1.5"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>{t('med_expand_radius')} ({selectedRadius === 5000 ? '10 km' : '20 km'})</span>
                </button>
              )}
            </div>
          )}

          {/* Real Stores List Cards */}
          {filteredStores.map((store) => {
            const isSelected = selectedStore?.id === store.id;
            const isSaved = savedIds.includes(store.id);
            const osmDirUrl = userCoords
              ? MedicalStoreService.getOsmDirectionsUrl(userCoords.latitude, userCoords.longitude, store.latitude, store.longitude)
              : MedicalStoreService.getDirectionsUrl(store.latitude, store.longitude, store.name);

            return (
              <div
                id={`store-card-${store.id}`}
                key={store.id}
                onClick={() => setSelectedStore(store)}
                className={`p-4 sm:p-5 rounded-3xl bg-white border transition-all duration-150 cursor-pointer ${
                  isSelected
                    ? 'border-emerald-600 ring-2 ring-emerald-500/30 shadow-md bg-emerald-50/20'
                    : 'border-stone-200 hover:border-emerald-300 hover:shadow-xs'
                }`}
              >
                {/* Top Row: Category & Distance */}
                <div className="flex items-center justify-between gap-2">
                  <span className="px-2.5 py-0.5 rounded-md bg-emerald-100/90 text-emerald-900 text-[10px] font-black tracking-wide uppercase">
                    {t(store.categoryKey) || store.category}
                  </span>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-emerald-800 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-emerald-700" />
                      <span>{store.distanceFormatted}</span>
                    </span>
                    <button
                      type="button"
                      onClick={(e) => handleToggleBookmark(e, store.id)}
                      className={`p-1.5 rounded-lg border transition-colors ${
                        isSaved
                          ? 'bg-amber-50 text-amber-700 border-amber-300'
                          : 'text-stone-400 hover:text-stone-700 border-transparent hover:bg-stone-100'
                      }`}
                      title={t('med_save_store')}
                    >
                      {isSaved ? <BookmarkCheck className="w-3.5 h-3.5 fill-amber-600" /> : <Bookmark className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Store Name */}
                <h3 className="text-sm font-black text-stone-900 mt-2 leading-snug">
                  {store.name}
                </h3>

                {/* Real Address */}
                <div className="text-[11px] text-stone-500 font-medium mt-1 leading-relaxed">
                  {store.address}
                </div>

                {/* Phone & Info if available */}
                <div className="flex flex-wrap items-center gap-3 mt-2.5 pt-2.5 border-t border-stone-100 text-[11px]">
                  {store.phone && (
                    <a
                      href={`tel:${store.phone}`}
                      onClick={(e) => e.stopPropagation()}
                      className="text-emerald-800 hover:text-emerald-950 font-bold flex items-center gap-1"
                    >
                      <Phone className="w-3 h-3 text-emerald-700" />
                      <span>{store.phone}</span>
                    </a>
                  )}

                  {store.website && (
                    <a
                      href={store.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-emerald-800 hover:text-emerald-950 font-bold flex items-center gap-1"
                    >
                      <Globe className="w-3 h-3 text-emerald-700" />
                      <span>{t('med_website')}</span>
                    </a>
                  )}

                  {store.openingHours && (
                    <span className="text-stone-500 font-medium flex items-center gap-1">
                      <Clock className="w-3 h-3 text-stone-400" />
                      <span>{store.openingHours}</span>
                    </span>
                  )}
                </div>

                {/* Action Buttons: Show Route (OSRM) & Get Directions */}
                <div className="flex items-center gap-2 mt-3 pt-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRequestRoute(store);
                    }}
                    disabled={isLoadingRoute}
                    className="flex-1 px-3.5 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-black text-xs transition-all shadow-xs flex items-center justify-center gap-1.5"
                  >
                    <RouteIcon className="w-3.5 h-3.5" />
                    <span>{t('med_show_route')}</span>
                  </button>

                  <a
                    href={osmDirUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="px-3 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs transition-colors flex items-center justify-center gap-1"
                    title={t('med_get_directions')}
                  >
                    <span>{t('med_get_directions')}</span>
                    <ArrowUpRight className="w-3 h-3 text-stone-600" />
                  </a>
                </div>
              </div>
            );
          })}

        </div>

      </div>

    </div>
  );
}
