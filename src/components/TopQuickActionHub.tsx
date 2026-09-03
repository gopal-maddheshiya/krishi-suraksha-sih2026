import { useState } from 'react';
import { 
  Tractor, CloudSun, ClipboardList, 
  BookOpen, ChevronDown, MapPin, Plus,
  Check, Sparkles, ArrowUpRight
} from 'lucide-react';
import { useLang } from '@/lib/LanguageContext';
import { useFarmContext } from '@/contexts/FarmContext';
import { LocationService } from '@/services/LocationService';
import type { GeoLocation } from '@/services/types';

interface TopQuickActionHubProps {
  onNavigateToWeather: () => void;
  onNavigateToMap: () => void;
  onNavigateToHistory: () => void;
  onNavigateToAdvisory: () => void;
  onAddNewFarm?: () => void;
}

export default function TopQuickActionHub({
  onNavigateToWeather,
  onNavigateToMap,
  onNavigateToHistory,
  onNavigateToAdvisory,
  onAddNewFarm,
}: TopQuickActionHubProps) {
  const { lang } = useLang();
  const { activeFarm, setActiveFarm, weather, risk, activeLocation } = useFarmContext();
  const [farmDropdownOpen, setFarmDropdownOpen] = useState(false);

  const temp = weather?.current?.temperatureC ? `${weather.current.temperatureC}°C` : '28°C';
  const district = activeFarm?.district || activeLocation?.district || 'Pune';
  const farmName = activeFarm?.farm_name || 'Main Field';
  const cropName = activeFarm?.crop?.name || 'Cotton';
  const areaAcres = activeFarm?.area_acres || 2.5;

  const sampleFarms = [
    {
      id: 'default_farm',
      farm_name: 'Main Field',
      district: 'Pune',
      state: 'Maharashtra',
      latitude: 18.5204,
      longitude: 73.8567,
      area_acres: 2.5,
      crop: { name: 'Cotton', stage: 'Flowering Stage', variety: 'Bt Cotton', sowing_date: '2026-06-15' },
    },
    {
      id: 'farm_2',
      farm_name: 'North Plot (Tomato)',
      district: 'Nashik',
      state: 'Maharashtra',
      latitude: 19.9975,
      longitude: 73.7898,
      area_acres: 1.5,
      crop: { name: 'Tomato', stage: 'Fruiting Stage', variety: 'Abhinav', sowing_date: '2026-07-01' },
    },
  ];

  return (
    <div className="w-full bg-white rounded-3xl p-3 sm:p-4 border border-stone-200 shadow-sm relative z-30">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3">
        
        {/* ============================================================= */}
        {/* 1. MY FARM & CROP (WITH DROPDOWN)                             */}
        {/* ============================================================= */}
        <div className="relative">
          <button
            onClick={() => setFarmDropdownOpen(!farmDropdownOpen)}
            className="w-full h-full text-left p-3 rounded-2xl bg-emerald-50/70 hover:bg-emerald-100/70 border border-emerald-200/80 transition-all flex items-center justify-between group active:scale-98"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center flex-shrink-0 shadow-xs">
                <Tractor className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div className="truncate">
                <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                  {lang === 'hi' ? 'मेरा खेत व फसल' : 'My Farm & Crop'}
                </span>
                <span className="text-xs sm:text-sm font-black text-stone-900 block truncate">
                  {farmName}
                </span>
                <span className="text-[11px] text-emerald-700 font-bold block truncate">
                  {cropName} • {areaAcres} {lang === 'hi' ? 'एकड़' : 'Ac'}
                </span>
              </div>
            </div>
            <ChevronDown className="w-4 h-4 text-emerald-700 flex-shrink-0 ml-1 group-hover:translate-y-0.5 transition-transform" />
          </button>

          {/* Farm Switcher Dropdown */}
          {farmDropdownOpen && (
            <div className="absolute top-full left-0 mt-2 w-72 sm:w-80 bg-white rounded-2xl shadow-2xl border border-stone-200 p-2 z-50 animate-in fade-in zoom-in-95">
              <div className="text-[11px] font-black text-stone-500 uppercase px-3 py-1.5 border-b border-stone-100">
                {lang === 'hi' ? 'खेत चुनें' : 'Select Farm'}
              </div>
              
              <div className="space-y-1 py-1">
                {sampleFarms.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => {
                      setActiveFarm(f as any);
                      setFarmDropdownOpen(false);
                    }}
                    className={`w-full text-left p-2.5 rounded-xl text-xs transition-all flex items-center justify-between ${
                      activeFarm?.id === f.id ? 'bg-emerald-50 font-black text-emerald-950' : 'hover:bg-stone-50 text-stone-700'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-stone-900">{f.farm_name}</div>
                      <div className="text-[10px] text-stone-500">{f.district}, {f.state} • {f.crop.name}</div>
                    </div>
                    {activeFarm?.id === f.id && <Check className="w-4 h-4 text-emerald-700" />}
                  </button>
                ))}
              </div>

              {onAddNewFarm && (
                <button
                  onClick={() => {
                    setFarmDropdownOpen(false);
                    onAddNewFarm();
                  }}
                  className="w-full mt-1 p-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{lang === 'hi' ? 'नया खेत जोड़ें' : 'Add New Farm'}</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* ============================================================= */}
        {/* 2. WEATHER & SPRAY DECISION                                   */}
        {/* ============================================================= */}
        <button
          onClick={onNavigateToWeather}
          className="text-left p-3 rounded-2xl bg-amber-50/70 hover:bg-amber-100/70 border border-amber-200/80 transition-all flex items-center justify-between group active:scale-98"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center flex-shrink-0 shadow-xs">
              <CloudSun className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div className="truncate">
              <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">
                {lang === 'hi' ? 'मौसम व छिड़काव' : 'Weather & Spray'}
              </span>
              <span className="text-xs sm:text-sm font-black text-stone-900 block truncate">
                {temp} • {district}
              </span>
              <span className="text-[11px] text-emerald-700 font-bold block truncate">
                {lang === 'hi' ? '✓ आज स्प्रे सुरक्षित' : '✓ Safe to spray'}
              </span>
            </div>
          </div>
          <ArrowUpRight className="w-4 h-4 text-amber-700 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>

        {/* ============================================================= */}
        {/* 3. MY CHECKS & HISTORY                                        */}
        {/* ============================================================= */}
        <button
          onClick={onNavigateToHistory}
          className="text-left p-3 rounded-2xl bg-purple-50/70 hover:bg-purple-100/70 border border-purple-200/80 transition-all flex items-center justify-between group active:scale-98"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center flex-shrink-0 shadow-xs">
              <ClipboardList className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div className="truncate">
              <span className="text-[10px] font-bold text-purple-800 uppercase tracking-wider block">
                {lang === 'hi' ? 'मेरी फसल जांच' : 'My Check History'}
              </span>
              <span className="text-xs sm:text-sm font-black text-stone-900 block truncate">
                {lang === 'hi' ? 'जांच इतिहास' : 'Scan Records'}
              </span>
              <span className="text-[11px] text-purple-700 font-bold block truncate">
                {lang === 'hi' ? 'दवाइयों के पर्चे →' : 'Prescriptions →'}
              </span>
            </div>
          </div>
          <ArrowUpRight className="w-4 h-4 text-purple-700 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>

        {/* ============================================================= */}
        {/* 4. GOVERNMENT & ICAR ADVISORIES                               */}
        {/* ============================================================= */}
        <button
          onClick={onNavigateToAdvisory}
          className="text-left p-3 rounded-2xl bg-teal-50/70 hover:bg-teal-100/70 border border-teal-200/80 transition-all flex items-center justify-between group active:scale-98"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-teal-700 text-white flex items-center justify-center flex-shrink-0 shadow-xs">
              <BookOpen className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div className="truncate">
              <span className="text-[10px] font-bold text-teal-800 uppercase tracking-wider block">
                {lang === 'hi' ? 'सरकारी कृषि सलाह' : 'ICAR Advisories'}
              </span>
              <span className="text-xs sm:text-sm font-black text-stone-900 block truncate">
                {lang === 'hi' ? 'ICAR गाइड' : 'KVK Bulletins'}
              </span>
              <span className="text-[11px] text-teal-700 font-bold block truncate">
                {lang === 'hi' ? 'प्रमाणित सिफारिशें →' : 'Official Guides →'}
              </span>
            </div>
          </div>
          <ArrowUpRight className="w-4 h-4 text-teal-700 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>

      </div>
    </div>
  );
}
