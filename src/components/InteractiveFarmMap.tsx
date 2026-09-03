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
    <div className="bg-white rounded-2xl border border-stone-200/90 shadow-sm overflow-hidden">
      {/* Header row */}
      <div className="flex items-center justify-between gap-3 px-4 sm:px-5 py-3 border-b border-stone-100">
        <div className="flex items-center gap-2.5 min-w-0">
          <MapPin className="w-4 h-4 text-emerald-700 stroke-[2.2] flex-shrink-0" />
          <div className="min-w-0">
            <div className="text-[10px] font-bold uppercase tracking-wider text-stone-500 truncate">
              {t('home_my_farm_location')}
            </div>
            <div className="text-sm font-extrabold text-stone-900 truncate">
              {farmName} · {district}, {state}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button
            onClick={handleDetectGPS}
            disabled={detectingGps}
            className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-stone-50 text-stone-700 font-bold text-[11px] border border-stone-200 transition-colors flex items-center gap-1"
          >
            <Navigation className={`w-3.5 h-3.5 text-emerald-700 ${detectingGps ? 'animate-spin' : ''}`} />
            <span>{detectingGps ? t('home_detecting') : t('home_locate_gps')}</span>
          </button>
          {onNavigateToSurveillance && (
            <button
              onClick={onNavigateToSurveillance}
              className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-stone-50 text-stone-700 font-bold text-[11px] border border-stone-200 transition-colors flex items-center gap-1"
            >
              <Layers className="w-3.5 h-3.5 text-stone-500" />
              <span className="hidden sm:inline">{t('home_surveillance')}</span>
            </button>
          )}
        </div>
      </div>

      {/* Compact map preview */}
      <div className="relative w-full h-36 sm:h-40 bg-stone-100">
        <iframe
          title="Farm Location Map"
          src={osmUrl}
          className="w-full h-full border-0"
          loading="lazy"
        />
        <div className="absolute bottom-2 left-2 z-10 bg-white/95 backdrop-blur px-2.5 py-1 rounded-lg shadow-sm border border-stone-200 text-[11px] font-bold text-stone-900 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
          <span className="truncate max-w-[180px]">{farmName} ({cropName})</span>
        </div>
        <a
          href={`https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=14/${lat}/${lon}`}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute bottom-2 right-2 z-10 px-2 py-0.5 rounded-md bg-white/90 backdrop-blur text-[10px] text-stone-600 hover:text-stone-900 font-semibold flex items-center gap-1 border border-stone-200"
        >
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      {/* Footer */}
      <div className="px-4 sm:px-5 py-2 bg-stone-50/80 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500">
        <span className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>{t('home_privacy')}</span>
        </span>
      </div>
    </div>
  );
}