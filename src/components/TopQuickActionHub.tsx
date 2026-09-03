import { useState } from 'react';
import {
  Tractor, ChevronDown, Plus, Check, MapPin, Sparkles
} from 'lucide-react';
import { useLang } from '@/lib/LanguageContext';
import { useFarmContext } from '@/contexts/FarmContext';

interface TopQuickActionHubProps {
  onAddNewFarm?: () => void;
}

export default function TopQuickActionHub({
  onAddNewFarm,
}: TopQuickActionHubProps) {
  const { t, lang } = useLang();
  const { activeFarm, setActiveFarm } = useFarmContext();
  const [farmDropdownOpen, setFarmDropdownOpen] = useState(false);

  const farmName = activeFarm?.farm_name || (lang === 'hi' ? 'मुख्य खेत (प्लॉट 1)' : 'Main Field (Plot 1)');
  const cropName = activeFarm?.crop?.name || (lang === 'hi' ? 'कपास' : 'Cotton');
  const cropStage = activeFarm?.crop?.stage || (lang === 'hi' ? 'फूल आने की अवस्था' : 'Flowering Stage');
  const areaAcres = activeFarm?.area_acres || 2.5;
  const district = activeFarm?.district || (lang === 'hi' ? 'पुणे, महाराष्ट्र' : 'Pune, MH');

  const sampleFarms = [
    {
      id: 'default_farm',
      farm_name: lang === 'hi' ? 'मुख्य खेत (प्लॉट 1)' : 'Main Field (Plot 1)',
      district: lang === 'hi' ? 'पुणे, महाराष्ट्र' : 'Pune, MH',
      state: 'Maharashtra',
      latitude: 18.5204,
      longitude: 73.8567,
      area_acres: 2.5,
      crop: { 
        name: lang === 'hi' ? 'कपास' : 'Cotton', 
        stage: lang === 'hi' ? 'फूल आने की अवस्था' : 'Flowering Stage', 
        variety: 'Bt Cotton II', 
        sowing_date: '2026-06-15' 
      },
    },
    {
      id: 'farm_2',
      farm_name: lang === 'hi' ? 'उत्तर प्लॉट (टमाटर)' : 'North Plot (Tomato)',
      district: lang === 'hi' ? 'नासिक, महाराष्ट्र' : 'Nashik, MH',
      state: 'Maharashtra',
      latitude: 19.9975,
      longitude: 73.7898,
      area_acres: 1.5,
      crop: { 
        name: lang === 'hi' ? 'टमाटर' : 'Tomato', 
        stage: lang === 'hi' ? 'फल लगने की अवस्था' : 'Fruiting Stage', 
        variety: 'Abhinav Hybrid', 
        sowing_date: '2026-07-01' 
      },
    },
  ];

  return (
    <div className="w-full py-2.5">
      <div className="relative">
        <button
          onClick={() => setFarmDropdownOpen(!farmDropdownOpen)}
          className="w-full text-left py-2 px-3 sm:px-4 rounded-2xl bg-white/90 hover:bg-white border border-stone-200/90 shadow-2xs hover:shadow-xs transition-all flex items-center justify-between gap-3 group min-h-[46px] backdrop-blur-xs"
          aria-haspopup="menu"
          aria-expanded={farmDropdownOpen}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-700 to-teal-800 text-white flex items-center justify-center flex-shrink-0 shadow-2xs">
              <Tractor className="w-4 h-4 stroke-[2.2]" />
            </div>
            
            <div className="min-w-0 flex items-center gap-2 flex-wrap">
              <span className="text-xs sm:text-sm font-black text-stone-900 truncate">
                {farmName}
              </span>
              <span className="hidden sm:inline-block text-stone-300">·</span>
              <span className="text-[11px] sm:text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/60 truncate">
                {cropName} ({areaAcres} {t('home_acres')})
              </span>
              <span className="hidden md:inline-flex items-center gap-1 text-xs text-stone-500 font-medium">
                <MapPin className="w-3 h-3 text-stone-400" />
                <span className="truncate">{district}</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1 text-xs font-bold text-stone-500 group-hover:text-stone-900 transition-colors flex-shrink-0 bg-stone-100/80 px-2.5 py-1 rounded-xl">
            <span>{t('home_select_farm')}</span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${farmDropdownOpen ? 'rotate-180' : ''}`} />
          </div>
        </button>

        {farmDropdownOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setFarmDropdownOpen(false)} />
            <div className="absolute top-full left-0 right-0 sm:left-auto sm:right-0 mt-2 w-full sm:w-88 bg-white rounded-3xl shadow-2xl border border-stone-200/90 p-2.5 z-50 animate-in zoom-in-95 duration-150">
              <div className="text-[10px] font-black text-stone-400 uppercase tracking-wider px-3 py-1.5 border-b border-stone-100 flex items-center justify-between">
                <span>{t('home_select_farm')}</span>
                <Sparkles className="w-3 h-3 text-emerald-600" />
              </div>

              <div className="space-y-1.5 py-2">
                {sampleFarms.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => {
                      setActiveFarm(f as any);
                      setFarmDropdownOpen(false);
                    }}
                    className={`w-full text-left p-3 rounded-2xl flex items-center justify-between gap-2 transition-all ${
                      activeFarm?.id === f.id
                        ? 'bg-emerald-50/90 border border-emerald-200 text-emerald-950 font-black'
                        : 'hover:bg-stone-50 text-stone-700 font-bold'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="text-xs sm:text-sm truncate">{f.farm_name}</div>
                      <div className="text-[11px] text-stone-500 font-medium mt-0.5 flex items-center gap-1">
                        <span>{f.crop.name}</span>
                        <span>•</span>
                        <span>{f.area_acres} {t('home_acres')}</span>
                        <span>•</span>
                        <span>{f.district}</span>
                      </div>
                    </div>
                    {activeFarm?.id === f.id && (
                      <div className="w-5 h-5 rounded-full bg-emerald-700 text-white flex items-center justify-center flex-shrink-0">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    )}
                  </button>
                ))}
              </div>

              {onAddNewFarm && (
                <div className="pt-2 border-t border-stone-100">
                  <button
                    onClick={() => {
                      setFarmDropdownOpen(false);
                      onAddNewFarm();
                    }}
                    className="w-full py-2.5 px-3 rounded-2xl bg-stone-900 hover:bg-black text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-[0.98]"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{t('home_add_farm')}</span>
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}