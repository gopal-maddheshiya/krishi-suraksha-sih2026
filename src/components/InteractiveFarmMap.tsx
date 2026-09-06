import { useState } from 'react';
import {
  MapPin, Navigation, Layers, ExternalLink, ShieldCheck,
} from 'lucide-react';
import { useLang } from '@/lib/LanguageContext';
import { useFarmContext } from '@/contexts/FarmContext';
import { LocationService } from '@/services/LocationService';

interface InteractiveFarmMapProps {
  onNavigateToSurveillance?: () => void;
}

export default function InteractiveFarmMap({ onNavigateToSurveillance }: InteractiveFarmMapProps) {
  const { t } = useLang();
  const { activeFarm, activeLocation, setActiveFarm } = useFarmContext();
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
        setActiveFarm({
          ...activeFarm,
          latitude: detected.latitude,
          longitude: detected.longitude,
          district: detected.district || activeFarm.district,
          state: detected.state || activeFarm.state,
        });
      }
    } catch {
    } finally {
      setDetectingGps(false);
    }
  };

  const osmUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${lon - 0.04}%2C${lat - 0.03}%2C${lon + 0.04}%2C${lat + 0.03}&layer=mapnik&marker=${lat}%2C${lon}`;

  return (
    <div className="bg-white/90 backdrop-blur-xl rounded-3xl border border-stone-200/60 shadow-[0_4px_20px_rgba(0,0,0,0.02)] overflow-hidden">
      {/* Header row */}
      <div className="flex items-center justify-between gap-3 px-5 sm:px-6 py-4 border-b border-stone-100">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200/80 flex items-center justify-center flex-shrink-0">
            <MapPin className="w-4 h-4 stroke-[2.2]" />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] font-black uppercase tracking-wider text-stone-500 truncate">
              {t('home_my_farm_location')}
            </div>
            <div className="text-sm sm:text-base font-black text-stone-900 truncate">
              {farmName} · {district}, {state}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={handleDetectGPS}
            disabled={detectingGps}
            className="px-3.5 py-2 rounded-xl bg-stone-50 hover:bg-stone-100 text-stone-800 font-bold text-xs border border-stone-200/80 transition-all flex items-center gap-1.5 shadow-2xs"
          >
            <Navigation className={`w-3.5 h-3.5 text-emerald-700 ${detectingGps ? 'animate-spin' : ''}`} />
            <span>{detectingGps ? t('home_detecting') : t('home_locate_gps')}</span>
          </button>
          {onNavigateToSurveillance && (
            <button
              onClick={onNavigateToSurveillance}
              className="px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100/80 text-emerald-900 font-bold text-xs border border-emerald-200/80 transition-all flex items-center gap-1.5 shadow-2xs"
            >
              <Layers className="w-3.5 h-3.5 text-emerald-700" />
              <span className="hidden sm:inline">{t('home_surveillance')}</span>
            </button>
          )}
        </div>
      </div>

      {/* Expanded map preview */}
      <div className="relative w-full h-52 sm:h-64 bg-stone-100">
        <iframe
          title="Farm Location Map"
          src={osmUrl}
          className="w-full h-full border-0"
          loading="lazy"
        />
        <div className="absolute bottom-3 left-3 z-10 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-md border border-stone-200/80 text-xs font-bold text-stone-900 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
          <span className="truncate max-w-[220px]">{farmName} ({cropName})</span>
        </div>
        <a
          href={`https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=14/${lat}/${lon}`}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute bottom-3 right-3 z-10 px-2.5 py-1 rounded-lg bg-white/90 backdrop-blur text-xs text-stone-600 hover:text-stone-900 font-bold flex items-center gap-1.5 border border-stone-200/80 shadow-xs"
        >
          <span>OSM Mapnik</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      {/* Footer */}
      <div className="px-5 sm:px-6 py-2.5 bg-stone-50/60 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500 font-medium">
        <span className="flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>{t('home_privacy')}</span>
        </span>
        <span className="text-[11px] text-stone-400">ISRO Bhuvan / OSM Standard</span>
      </div>
    </div>
  );
}