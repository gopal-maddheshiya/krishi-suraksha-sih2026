import { useState } from 'react';
import { MapPin, Navigation, ChevronDown, Check, Loader2 } from 'lucide-react';
import { LocationService, PAN_INDIA_STATES, type IndianDistrict } from '@/services/LocationService';
import type { GeoLocation } from '@/services/types';
import { useLang } from '@/lib/LanguageContext';

interface LocationBarProps {
  onLocationChange?: (loc: GeoLocation) => void;
}

export default function LocationBar({ onLocationChange }: LocationBarProps) {
  const { lang } = useLang();
  const [currentLocation, setCurrentLocation] = useState<GeoLocation>(() => LocationService.getSavedLocation());
  const [isOpen, setIsOpen] = useState(false);
  const [loadingGps, setLoadingGps] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [selectedStateCode, setSelectedStateCode] = useState('MH');

  const handleGpsDetect = async () => {
    setLoadingGps(true);
    setGpsError(null);
    try {
      const loc = await LocationService.requestDeviceGPS();
      setCurrentLocation(loc);
      setIsOpen(false);
      if (onLocationChange) onLocationChange(loc);
    } catch (err) {
      setGpsError(err instanceof Error ? err.message : 'GPS detection failed');
    } finally {
      setLoadingGps(false);
    }
  };

  const handleDistrictSelect = (stateCode: string, districtId: string) => {
    const loc = LocationService.setLocationByDistrictId(stateCode, districtId);
    setCurrentLocation(loc);
    setIsOpen(false);
    setGpsError(null);
    if (onLocationChange) onLocationChange(loc);
  };

  const currentState = PAN_INDIA_STATES.find((s) => s.code === selectedStateCode) || PAN_INDIA_STATES[0];

  return (
    <div className="relative inline-block text-left">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 text-emerald-900 font-semibold text-xs sm:text-sm transition-all"
      >
        <MapPin className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
        <span className="truncate max-w-[130px] sm:max-w-[180px]">{currentLocation.district}, {currentLocation.state}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-emerald-600 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute left-0 sm:right-0 sm:left-auto mt-2 w-72 sm:w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
            
            {/* GPS Action */}
            <div className="mb-2.5 pb-2.5 border-b border-gray-100">
              <button
                onClick={handleGpsDetect}
                disabled={loadingGps}
                className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-sm disabled:opacity-75"
              >
                {loadingGps ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Navigation className="w-4 h-4" />
                )}
                <span>
                  {lang === 'hi'
                    ? 'मेरा GPS स्थान प्राप्त करें'
                    : 'Use My GPS Location'}
                </span>
              </button>

              {gpsError && (
                <div className="text-[11px] text-rose-600 mt-1.5 px-1 leading-tight">
                  {gpsError}
                </div>
              )}
            </div>

            {/* State Switcher */}
            <div className="mb-2">
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                {lang === 'hi' ? 'राज्य चुनें' : 'Select State'}
              </label>
              <select
                value={selectedStateCode}
                onChange={(e) => setSelectedStateCode(e.target.value)}
                className="w-full p-2 rounded-xl border border-gray-200 bg-gray-50 text-xs font-semibold text-gray-800 outline-none"
              >
                {PAN_INDIA_STATES.map((s) => (
                  <option key={s.code} value={s.code}>
                    {s.name} {s.nameHi ? `(${s.nameHi})` : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* District Selector Header */}
            <div className="px-1 py-1 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              {lang === 'hi' ? 'जिले चुनें' : 'Select District'}
            </div>

            {/* Districts List */}
            <div className="max-h-48 overflow-y-auto space-y-1 pr-1">
              {currentState.districts.map((d: IndianDistrict) => {
                const isSelected = currentLocation.district.toLowerCase() === d.name.toLowerCase();
                const districtName = lang === 'hi' ? d.nameHi : d.name;

                return (
                  <button
                    key={d.id}
                    onClick={() => handleDistrictSelect(currentState.code, d.id)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs sm:text-sm font-medium flex items-center justify-between transition-colors ${
                      isSelected
                        ? 'bg-emerald-50 text-emerald-800 font-bold'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <span>{districtName}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                  </button>
                );
              })}
            </div>

          </div>
        </>
      )}
    </div>
  );
}
