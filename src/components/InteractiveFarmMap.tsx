import { useState } from 'react';
import { 
  MapPin, Navigation, Compass, Layers, 
  Maximize2, ExternalLink, ShieldCheck, Tractor, 
  Sparkles, RefreshCw, ZoomIn, ZoomOut 
} from 'lucide-react';
import { useLang } from '@/lib/LanguageContext';
import { useFarmContext } from '@/contexts/FarmContext';
import { LocationService } from '@/services/LocationService';

interface InteractiveFarmMapProps {
  onNavigateToSurveillance?: () => void;
}

export default function InteractiveFarmMap({ onNavigateToSurveillance }: InteractiveFarmMapProps) {
  const { lang, t } = useLang();
  const { activeFarm, activeLocation, setActiveFarm } = useFarmContext();
  const [zoom, setZoom] = useState(13);
  const [detectingGps, setDetectingGps] = useState(false);

  const lat = activeFarm?.latitude || activeLocation?.latitude || 20.3888;
  const lon = activeFarm?.longitude || activeLocation?.longitude || 78.1204;
  const farmName = activeFarm?.farm_name || 'My Farm';
  const cropName = activeFarm?.crop?.name || 'Cotton';
  const district = activeFarm?.district || activeLocation?.district || 'Yavatmal';
  const state = activeFarm?.state || activeLocation?.state || 'Maharashtra';

  const handleDetectGPS = async () => {
    setDetectingGps(true);
    try {
      const detected = await LocationService.requestDeviceGPS();
      if (activeFarm) {
        const updated = {
          ...activeFarm,
          latitude: detected.latitude,
          longitude: detected.longitude,
          district: detected.district || activeFarm.district,
          state: detected.state || activeFarm.state,
        };
        setActiveFarm(updated);
      }
    } catch (e) {
      console.warn('GPS detection failed:', e);
    } finally {
      setDetectingGps(false);
    }
  };

  // OpenStreetMap embed URL with marker bounding
  const osmUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${lon - 0.04}%2C${lat - 0.03}%2C${lon + 0.04}%2C${lat + 0.03}&layer=mapnik&marker=${lat}%2C${lon}`;

  return (
    <div className="bg-white rounded-3xl border border-gray-200/90 shadow-sm overflow-hidden mb-8">
      
      {/* Map Card Header */}
      <div className="p-5 sm:p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              {lang === 'hi' ? 'खेत मानचित्र' : lang === 'mr' ? 'शेत नकाशा' : 'Farm Geo-Location'}
            </span>
            <span className="text-xs text-gray-400 font-mono">
              {lat.toFixed(4)}° N, {lon.toFixed(4)}° E
            </span>
          </div>

          <h3 className="text-lg sm:text-xl font-black text-gray-900 flex items-center gap-2">
            <span>{farmName}</span>
            <span className="text-xs font-semibold text-gray-500">• {cropName} ({activeFarm?.area_acres || 2.5} Acres)</span>
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            📍 {district}, {state}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleDetectGPS}
            disabled={detectingGps}
            className="px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs border border-emerald-200 transition-colors flex items-center gap-1.5 active:scale-95"
          >
            <Navigation className={`w-3.5 h-3.5 text-emerald-600 ${detectingGps ? 'animate-spin' : ''}`} />
            <span>{detectingGps ? (lang === 'hi' ? 'खोज रहा है...' : 'Detecting...') : (lang === 'hi' ? 'GPS से खोजें' : 'Locate GPS')}</span>
          </button>

          {onNavigateToSurveillance && (
            <button
              onClick={onNavigateToSurveillance}
              className="px-3.5 py-2 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold text-xs border border-gray-200 transition-colors flex items-center gap-1.5"
            >
              <Layers className="w-3.5 h-3.5 text-gray-500" />
              <span>{lang === 'hi' ? 'क्षेत्रीय निगरानी देखें' : 'View District Surveillance'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Interactive Map Iframe Container */}
      <div className="relative w-full h-72 sm:h-96 bg-stone-100">
        <iframe
          title="Farm Location Map"
          src={osmUrl}
          className="w-full h-full border-0 pointer-events-auto"
          loading="lazy"
        />

        {/* Floating Farm Badge Overlay */}
        <div className="absolute bottom-4 left-4 z-10 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-2xl shadow-lg border border-gray-200 text-xs text-gray-900 font-bold flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-emerald-600 animate-ping" />
          <span>{farmName} ({cropName})</span>
        </div>

        {/* OpenStreetMap Attribution & External Link */}
        <div className="absolute bottom-4 right-4 z-10">
          <a
            href={`https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=14/${lat}/${lon}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-2.5 py-1 rounded-xl bg-white/90 backdrop-blur-md shadow text-[10px] text-gray-600 hover:text-gray-900 font-semibold flex items-center gap-1 border border-gray-200"
          >
            <span>OpenStreetMap</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* Footer Info */}
      <div className="p-3.5 bg-gray-50/80 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500 flex-wrap gap-2">
        <span className="flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>{lang === 'hi' ? 'गोपनीयता सुरक्षित: केवल आप अपने खेत का सटीक स्थान देख सकते हैं।' : 'Privacy Protected: Only you can view your precise farm coordinates.'}</span>
        </span>
        <span className="font-mono text-gray-400">OpenStreetMap Data</span>
      </div>

    </div>
  );
}
