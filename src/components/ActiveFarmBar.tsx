import { useState, useEffect } from 'react';
import { 
  Tractor, Sprout, MapPin, ChevronDown, Plus, 
  Check, Calendar, Droplets, RefreshCw
} from 'lucide-react';
import { useLang } from '@/lib/LanguageContext';
import { LocationService } from '@/services/LocationService';
import type { GeoLocation } from '@/services/types';

export interface ActiveFarmData {
  id: string;
  farm_name: string;
  state: string;
  district: string;
  taluka?: string;
  village?: string;
  latitude: number;
  longitude: number;
  area_acres: number;
  soil_type?: string;
  irrigation_type?: string;
  crop: {
    name: string;
    variety?: string;
    sowing_date: string;
    stage: string;
  };
}

interface ActiveFarmBarProps {
  onFarmChange?: (farm: ActiveFarmData) => void;
  onAddNewFarm?: () => void;
}

export default function ActiveFarmBar({ onFarmChange, onAddNewFarm }: ActiveFarmBarProps) {
  const { lang } = useLang();
  const [activeFarm, setActiveFarm] = useState<ActiveFarmData>(() => {
    try {
      const stored = localStorage.getItem('crophealth_active_farm');
      if (stored) return JSON.parse(stored);
    } catch {}
    const loc = LocationService.getSavedLocation();
    return {
      id: 'default_farm',
      farm_name: 'Main Field',
      state: loc.state,
      district: loc.district,
      taluka: loc.taluka,
      village: loc.village,
      latitude: loc.latitude,
      longitude: loc.longitude,
      area_acres: 2.5,
      soil_type: 'Black Cotton',
      irrigation_type: 'Drip Irrigation',
      crop: {
        name: 'Cotton',
        variety: 'Bt Cotton',
        sowing_date: '2026-06-15',
        stage: 'Flowering Stage',
      },
    };
  });

  const [isOpen, setIsOpen] = useState(false);

  const handleSelectFarm = (f: ActiveFarmData) => {
    setActiveFarm(f);
    localStorage.setItem('crophealth_active_farm', JSON.stringify(f));
    
    const loc: GeoLocation = {
      latitude: f.latitude,
      longitude: f.longitude,
      state: f.state,
      district: f.district,
      taluka: f.taluka,
      village: f.village,
      isGPSDetected: false,
      accuracyMeters: 1000,
      source: 'Selected Farm Location',
    };
    LocationService.saveLocation(loc);

    setIsOpen(false);
    if (onFarmChange) onFarmChange(f);
  };

  return (
    <div className="bg-white rounded-2xl p-3.5 sm:p-4 shadow-sm border border-gray-200/80 mb-5 transition-all">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        
        {/* Farm Name & Crop Dominance */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center flex-shrink-0 text-emerald-700">
            <Tractor className="w-5 h-5 stroke-[2.2]" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-gray-900 text-sm sm:text-base tracking-tight">
                {activeFarm.farm_name}
              </span>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                {activeFarm.crop.name}
              </span>
              <span className="text-xs text-gray-500 font-medium hidden md:inline">
                • {activeFarm.crop.stage} ({activeFarm.area_acres} Acres)
              </span>
            </div>

            <div className="text-xs text-gray-500 flex items-center gap-1.5 mt-0.5">
              <MapPin className="w-3 h-3 text-gray-400" />
              <span>{activeFarm.district}, {activeFarm.state}</span>
            </div>
          </div>
        </div>

        {/* Switch Farm Dropdown Action */}
        <div className="relative self-end sm:self-center">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-50 hover:bg-gray-100 active:bg-gray-200 text-gray-700 font-bold text-xs border border-gray-200 transition-colors"
          >
            <span>{lang === 'hi' ? 'खेत बदलें' : lang === 'mr' ? 'शेत बदला' : 'Switch Farm'}</span>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
          </button>

          {isOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
              <div className="absolute right-0 mt-2 w-72 bg-white text-gray-900 rounded-2xl shadow-2xl border border-gray-100 p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-3 py-1.5 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  {lang === 'hi' ? 'पंजीकृत खेत' : 'Registered Farms'}
                </div>
                
                <button
                  onClick={() => handleSelectFarm(activeFarm)}
                  className="w-full text-left p-2.5 rounded-xl bg-emerald-50 text-emerald-900 font-bold text-xs sm:text-sm flex items-center justify-between"
                >
                  <div>
                    <div>{activeFarm.farm_name} ({activeFarm.area_acres} Acres)</div>
                    <div className="text-[11px] font-normal text-emerald-700">{activeFarm.crop.name} • {activeFarm.district}</div>
                  </div>
                  <Check className="w-4 h-4 text-emerald-600" />
                </button>

                {onAddNewFarm && (
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      onAddNewFarm();
                    }}
                    className="w-full mt-2 p-2 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{lang === 'hi' ? '+ नया खेत जोड़ें' : '+ Add New Farm'}</span>
                  </button>
                )}
              </div>
            </>
          )}
        </div>

      </div>
    </div>
  );
}
