import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import type { 
  MedicalStore, 
  UserCoordinates, 
  OsrmRoute, 
  FarmingCategory,
  LocationDetails 
} from '@/services/MedicalStoreService';
import { MedicalStoreService } from '@/services/MedicalStoreService';
import { useLang } from '@/lib/LanguageContext';
import { Navigation, ZoomIn, ZoomOut, MapPin, X, Car } from 'lucide-react';

interface LeafletMapViewProps {
  userCoords: UserCoordinates | null;
  locationDetails?: LocationDetails | null;
  stores: MedicalStore[];
  selectedStore: MedicalStore | null;
  onSelectStore: (store: MedicalStore) => void;
  onLocateMe: () => void;
  isLocating?: boolean;
  placeName?: string;
  activeRoute?: OsrmRoute | null;
  onClearRoute?: () => void;
  onRequestRoute?: (store: MedicalStore) => void;
  isLoadingRoute?: boolean;
  className?: string;
}

const CATEGORY_STYLES: Record<FarmingCategory, { bg: string; icon: string }> = {
  all: { bg: '#15803d', icon: '🏪' },
  medicine: { bg: '#1d4ed8', icon: '💊' },
  pesticide: { bg: '#b91c1c', icon: '🛡️' },
  fertilizer: { bg: '#b45309', icon: '🧪' },
  seeds: { bg: '#0f766e', icon: '🌾' },
  agri_input: { bg: '#15803d', icon: '🌱' },
  krishi_kendra: { bg: '#166534', icon: '🏢' },
  agri_equipment: { bg: '#0369a1', icon: '⚙️' },
  tractor_machinery: { bg: '#c2410c', icon: '🚜' },
  nursery: { bg: '#4d7c0f', icon: '🪴' },
  veterinary: { bg: '#4338ca', icon: '🐾' },
  other_services: { bg: '#475569', icon: '⚖️' },
};

export default function LeafletMapView({
  userCoords,
  locationDetails,
  stores,
  selectedStore,
  onSelectStore,
  onLocateMe,
  isLocating = false,
  placeName = '',
  activeRoute = null,
  onClearRoute,
  onRequestRoute,
  isLoadingRoute = false,
  className = '',
}: LeafletMapViewProps) {
  const { t } = useLang();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const userAccuracyCircleRef = useRef<L.Circle | null>(null);
  const storeMarkersRef = useRef<Map<string, L.Marker>>(new Map());
  const routePolylineRef = useRef<L.Polyline | null>(null);
  const [resolvedPlaceName, setResolvedPlaceName] = useState<string>(placeName);

  // 1. Initialize Leaflet Map (Attribution watermark removed as requested)
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const initialLat = userCoords?.latitude || 20.3888;
    const initialLon = userCoords?.longitude || 78.1204;

    const map = L.map(mapContainerRef.current, {
      center: [initialLat, initialLon],
      zoom: 13,
      zoomControl: false,
      attributionControl: false, // Attribution watermark disabled
    });

    // Clean OpenStreetMap TileLayer without watermarks
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
    }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // 2. Resolve place name when coordinates update
  useEffect(() => {
    if (placeName) {
      setResolvedPlaceName(placeName);
      return;
    }
    if (locationDetails?.placeName) {
      setResolvedPlaceName(locationDetails.placeName);
      return;
    }
    if (!userCoords) return;

    setResolvedPlaceName('');
    MedicalStoreService.reverseGeocode(userCoords.latitude, userCoords.longitude)
      .then((name) => {
        if (name) setResolvedPlaceName(name);
      })
      .catch(() => {});
  }, [userCoords, placeName, locationDetails]);

  // 3. Render User Marker + High-Accuracy GPS Radius Circle + Rich Location Data Popup
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !userCoords) return;

    const { latitude, longitude, accuracyMeters } = userCoords;
    const locationLabel = locationDetails?.placeName || resolvedPlaceName || `${latitude.toFixed(5)}°, ${longitude.toFixed(5)}°`;

    // Accuracy Circle around user's location
    const circleRadius = Math.max(15, Math.min(accuracyMeters || 25, 2000));
    if (userAccuracyCircleRef.current) {
      userAccuracyCircleRef.current.setLatLng([latitude, longitude]);
      userAccuracyCircleRef.current.setRadius(circleRadius);
    } else {
      userAccuracyCircleRef.current = L.circle([latitude, longitude], {
        radius: circleRadius,
        color: '#059669',
        fillColor: '#10b981',
        fillOpacity: 0.12,
        weight: 1.5,
        dashArray: '4, 6',
      }).addTo(map);
    }

    const userIcon = L.divIcon({
      className: 'custom-user-pin',
      html: `
        <div class="relative flex items-center justify-center w-10 h-10">
          <span class="absolute inline-flex w-full h-full rounded-full bg-emerald-500 opacity-40 animate-ping"></span>
          <span class="absolute inline-flex w-8 h-8 rounded-full bg-emerald-400 opacity-25 animate-ping" style="animation-delay:0.3s"></span>
          <span class="relative inline-flex items-center justify-center w-7 h-7 rounded-full bg-emerald-700 text-white shadow-xl border-2 border-white font-black text-sm">
            📍
          </span>
        </div>
      `,
      iconSize: [40, 40],
      iconAnchor: [20, 20],
      popupAnchor: [0, -22],
    });

    const popupContent = `
      <div style="padding: 6px; font-family: system-ui, -apple-system, sans-serif; min-width: 220px;">
        <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #e7e5e4; padding-bottom: 4px;">
          <span style="font-size: 11px; font-weight: 800; color: #065f46; display: flex; items-center; gap: 4px;">
            📍 आपका वर्तमान स्थान
          </span>
          <span style="font-size: 9px; font-weight: 800; background: #d1fae5; color: #065f46; padding: 2px 5px; border-radius: 6px;">
            GPS LOCKED
          </span>
        </div>
        
        <div style="font-size: 12px; font-weight: 900; color: #1c1917; margin-top: 5px; line-height: 1.35;">
          ${locationLabel}
        </div>

        ${locationDetails?.district ? `
          <div style="font-size: 11px; color: #57534e; margin-top: 3px; font-weight: 600;">
            जिला: ${locationDetails.district}${locationDetails.state ? `, ${locationDetails.state}` : ''}
          </div>
        ` : ''}

        ${locationDetails?.postcode ? `
          <div style="font-size: 10px; color: #78716c; margin-top: 1px; font-weight: 600;">
            पिन कोड: <span style="color: #065f46; font-weight: 800;">${locationDetails.postcode}</span>
          </div>
        ` : ''}

        <div style="margin-top: 6px; padding-top: 5px; border-top: 1px solid #f5f5f4; font-size: 10px; color: #78716c;">
          <div>कॉर्डिनेट्स: <strong style="color: #292524;">${latitude.toFixed(6)}°, ${longitude.toFixed(6)}°</strong></div>
          <div style="color: #059669; font-weight: 800; margin-top: 2px;">
            🎯 जीपीएस सटीकता: ±${Math.round(accuracyMeters || 10)} मीटर
          </div>
        </div>
      </div>
    `;

    if (userMarkerRef.current) {
      userMarkerRef.current.setLatLng([latitude, longitude]);
      userMarkerRef.current.setPopupContent(popupContent);
    } else {
      userMarkerRef.current = L.marker([latitude, longitude], {
        icon: userIcon,
        zIndexOffset: 1000,
      })
        .addTo(map)
        .bindPopup(popupContent);

      setTimeout(() => {
        userMarkerRef.current?.openPopup();
      }, 500);
    }

    if (!activeRoute) {
      map.setView([latitude, longitude], 14, { animate: true });
    }
  }, [userCoords, resolvedPlaceName, locationDetails, activeRoute]);

  // 4. Update Store Markers on Map with Category Badges & Popups
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    storeMarkersRef.current.forEach((marker) => marker.remove());
    storeMarkersRef.current.clear();

    stores.forEach((store) => {
      const isSelected = selectedStore?.id === store.id;
      const catStyle = CATEGORY_STYLES[store.category] || CATEGORY_STYLES.agri_input;

      const selectedRing = isSelected
        ? `box-shadow: 0 0 0 3px #fbbf24, 0 0 0 7px rgba(251, 191, 36, 0.4);`
        : '';
      const scale = isSelected ? 'transform: scale(1.28); z-index: 1000;' : '';

      const storeIcon = L.divIcon({
        className: 'custom-store-pin',
        html: `
          <div style="position:relative;${scale}transition:transform 0.2s ease-out;">
            ${isSelected ? `<span style="position:absolute;inset:-5px;border-radius:50%;background:rgba(251,191,36,0.4);animation:ping 1s infinite;"></span>` : ''}
            <div style="width:34px;height:34px;border-radius:10px;background:${catStyle.bg};color:white;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,0.3);border:2px solid white;font-size:15px;${selectedRing}">
              ${catStyle.icon}
            </div>
          </div>
        `,
        iconSize: [34, 34],
        iconAnchor: [17, 17],
        popupAnchor: [0, -20],
      });

      const osmDirUrl = userCoords
        ? MedicalStoreService.getOsmDirectionsUrl(userCoords.latitude, userCoords.longitude, store.latitude, store.longitude)
        : `https://www.openstreetmap.org/?mlat=${store.latitude}&mlon=${store.longitude}#map=16/${store.latitude}/${store.longitude}`;

      const popupHtml = `
        <div style="padding:6px;max-width:230px;font-family:system-ui, -apple-system, sans-serif;">
          <div style="font-size:10px;font-weight:800;color:${catStyle.bg};text-transform:uppercase;letter-spacing:0.04em;display:flex;align-items:center;gap:4px;">
            <span>${catStyle.icon}</span>
            <span>${t(store.categoryKey) || store.category}</span>
          </div>
          <div style="font-size:12px;font-weight:900;color:#1c1917;margin-top:3px;line-height:1.35;">
            ${store.name}
          </div>
          <div style="font-size:11px;font-weight:700;color:#15803d;margin-top:4px;">
            📍 ${store.distanceFormatted} away
          </div>
          ${store.address && store.address !== 'OpenStreetMap Verified Location' ? `
            <div style="font-size:10px;color:#78716c;margin-top:2px;line-height:1.4;">${store.address}</div>
          ` : ''}
          ${store.phone ? `
            <div style="font-size:10px;color:#15803d;font-weight:700;margin-top:4px;">
              <a href="tel:${store.phone}" style="color:#15803d;text-decoration:none;">📞 ${store.phone}</a>
            </div>
          ` : ''}
          <div style="display:flex;gap:6px;margin-top:8px;padding-top:6px;border-top:1px solid #f5f5f4;">
            <a
              href="${osmDirUrl}"
              target="_blank"
              rel="noopener noreferrer"
              style="flex:1;background:#15803d;color:white;font-size:10px;font-weight:800;padding:5px 8px;border-radius:8px;text-align:center;text-decoration:none;display:inline-block;"
            >
              Directions ↗
            </a>
          </div>
        </div>
      `;

      const marker = L.marker([store.latitude, store.longitude], { icon: storeIcon })
        .addTo(map)
        .bindPopup(popupHtml);

      marker.on('click', () => {
        onSelectStore(store);
      });

      storeMarkersRef.current.set(store.id, marker);
    });
  }, [stores, selectedStore, onSelectStore, t, userCoords]);

  // 5. Center/Fly to Selected Store
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !selectedStore) return;

    map.flyTo([selectedStore.latitude, selectedStore.longitude], 16, {
      duration: 1.0,
    });

    const marker = storeMarkersRef.current.get(selectedStore.id);
    if (marker) {
      setTimeout(() => marker.openPopup(), 600);
    }
  }, [selectedStore]);

  // 6. Draw Free OSRM Routing Polyline on Map
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (routePolylineRef.current) {
      routePolylineRef.current.remove();
      routePolylineRef.current = null;
    }

    if (activeRoute && activeRoute.coordinates.length > 0) {
      const polyline = L.polyline(activeRoute.coordinates, {
        color: '#059669',
        weight: 5,
        opacity: 0.9,
        lineJoin: 'round',
      }).addTo(map);

      routePolylineRef.current = polyline;

      map.fitBounds(polyline.getBounds(), {
        padding: [50, 50],
        maxZoom: 16,
      });
    }
  }, [activeRoute]);

  const handleZoomIn = () => mapInstanceRef.current?.zoomIn();
  const handleZoomOut = () => mapInstanceRef.current?.zoomOut();

  const handleRecenter = () => {
    if (userCoords && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([userCoords.latitude, userCoords.longitude], 14, {
        duration: 0.8,
      });
      setTimeout(() => userMarkerRef.current?.openPopup(), 500);
    } else {
      onLocateMe();
    }
  };

  return (
    <div className={`relative w-full h-full min-h-[380px] rounded-3xl overflow-hidden border border-stone-200/90 shadow-sm ${className}`}>
      <style>{`
        .leaflet-control-attribution {
          display: none !important;
        }
      `}</style>

      {/* Map DOM Container */}
      <div ref={mapContainerRef} className="w-full h-full min-h-[380px] z-0" />

      {/* Floating Active Route Banner (OSRM) */}
      {activeRoute && (
        <div className="absolute top-3 left-3 right-16 z-20 animate-in slide-in-from-top-2">
          <div className="p-3 bg-emerald-900/95 backdrop-blur-md text-white rounded-2xl shadow-xl border border-emerald-700/80 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/30 flex items-center justify-center flex-shrink-0">
                <Car className="w-4 h-4 text-emerald-300" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-black truncate flex items-center gap-2">
                  <span>{activeRoute.durationFormatted}</span>
                  <span className="text-emerald-300 font-bold">({activeRoute.distanceFormatted})</span>
                </div>
                <div className="text-[10px] text-emerald-200/80 font-medium truncate">
                  OSRM Free Open Route
                </div>
              </div>
            </div>

            {onClearRoute && (
              <button
                type="button"
                onClick={onClearRoute}
                className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-emerald-100 hover:text-white transition-colors flex-shrink-0"
                title={t('med_clear_route')}
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Floating Map Controls (Top Right) */}
      <div className="absolute top-3 right-3 z-10 flex flex-col gap-2">
        {/* My Location Button */}
        <button
          type="button"
          onClick={handleRecenter}
          disabled={isLocating}
          className="p-2.5 bg-white/95 backdrop-blur-md hover:bg-emerald-50 text-stone-700 hover:text-emerald-800 rounded-2xl shadow-lg border border-stone-200 font-bold transition-all active:scale-95 flex items-center gap-1.5"
          title={t('med_my_location')}
        >
          <Navigation className={`w-4 h-4 text-emerald-700 ${isLocating ? 'animate-spin' : ''}`} />
          <span className="text-xs font-black hidden sm:inline pr-0.5">{t('med_my_location')}</span>
        </button>

        {/* Zoom Controls */}
        <button
          type="button"
          onClick={handleZoomIn}
          className="p-2.5 bg-white/95 backdrop-blur-md hover:bg-stone-100 text-stone-700 rounded-xl shadow-md border border-stone-200 transition-colors flex items-center justify-center"
          title="Zoom in"
        >
          <ZoomIn className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={handleZoomOut}
          className="p-2.5 bg-white/95 backdrop-blur-md hover:bg-stone-100 text-stone-700 rounded-xl shadow-md border border-stone-200 transition-colors flex items-center justify-center"
          title="Zoom out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
      </div>

      {/* Current Location Name Badge — bottom left */}
      <div className="absolute bottom-3 left-3 z-10 pointer-events-none max-w-[70%]">
        <div className="px-3 py-1.5 rounded-xl bg-white/95 backdrop-blur-md text-[11px] font-black text-stone-800 shadow-md border border-stone-200/80 flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
          <span className="truncate">
            {locationDetails?.placeName || resolvedPlaceName || `${userCoords?.latitude?.toFixed(4) || '--'}°, ${userCoords?.longitude?.toFixed(4) || '--'}°`}
          </span>
          {userCoords?.accuracyMeters && (
            <span className="text-[10px] text-emerald-700 font-bold hidden sm:inline">
              (±{Math.round(userCoords.accuracyMeters)}m)
            </span>
          )}
        </div>
      </div>

      {/* Real Live GPS Locked Badge — bottom right */}
      <div className="absolute bottom-3 right-3 z-10 pointer-events-none">
        <div className="px-2.5 py-1.5 rounded-xl bg-emerald-800/95 backdrop-blur-md text-[10px] font-black text-white shadow-sm flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse" />
          <span>GPS LIVE</span>
        </div>
      </div>
    </div>
  );
}
