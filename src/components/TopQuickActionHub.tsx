import { useState } from 'react';
import {
  Tractor, ChevronDown, Plus, Check, MapPin, Sparkles
} from 'lucide-react';
import { useLang } from '@/lib/LanguageContext';
import { useFarmContext } from '@/contexts/FarmContext';
import { getLocalizedCropName, getLocalizedStageName } from '@/lib/agriLocalization';
import type { LanguageCode } from '@/lib/i18n';

interface TopQuickActionHubProps {
  onAddNewFarm?: () => void;
}

export default function TopQuickActionHub({
  onAddNewFarm,
}: TopQuickActionHubProps) {
  const { t, lang } = useLang();
  const { activeFarm, setActiveFarm } = useFarmContext();
  const [farmDropdownOpen, setFarmDropdownOpen] = useState(false);

  const rawCropName = activeFarm?.crop?.name || 'Cotton';
  const cropName = getLocalizedCropName(rawCropName, lang);
  const rawCropStage = activeFarm?.crop?.stage || 'Flowering Stage';
  const cropStage = getLocalizedStageName(rawCropStage, lang);
  const farmName = activeFarm?.farm_name || (lang === 'hi' ? 'मुख्य खेत (प्लॉट 1)' : lang === 'mr' ? 'मुख्य शेत (प्लॉट 1)' : 'Main Field (Plot 1)');
  const areaAcres = activeFarm?.area_acres || 2.5;
  const district = activeFarm?.district || (lang === 'hi' ? 'पुणे, महाराष्ट्र' : lang === 'mr' ? 'पुणे, महाराष्ट्र' : 'Pune, MH');

  const defaultFarms = [
    {
      id: 'default_farm',
      farm_name: lang === 'hi' ? 'मुख्य खेत (प्लॉट 1)' : lang === 'mr' ? 'मुख्य शेत (प्लॉट 1)' : 'Main Field (Plot 1)',
      district: lang === 'hi' ? 'पुणे, महाराष्ट्र' : 'Pune, MH',
      state: 'Maharashtra',
      latitude: 18.5204,
      longitude: 73.8567,
      area_acres: 2.5,
      crop: { 
        name: 'Cotton', 
        stage: 'Flowering Stage', 
        variety: 'Bt Cotton II', 
        sowing_date: '2026-06-15' 
      },
    },
    {
      id: 'farm_2',
      farm_name: lang === 'hi' ? 'उत्तर प्लॉट (टमाटर)' : lang === 'mr' ? 'उत्तर प्लॉट (टोमॅटो)' : 'North Plot (Tomato)',
      district: lang === 'hi' ? 'नासिक, महाराष्ट्र' : 'Nashik, MH',
      state: 'Maharashtra',
      latitude: 19.9975,
      longitude: 73.7898,
      area_acres: 1.5,
      crop: { 
        name: 'Tomato', 
        stage: 'Fruiting Stage', 
        variety: 'Abhinav Hybrid', 
        sowing_date: '2026-07-01' 
      },
    },
  ];

  const getCustomFarms = () => {
    try {
      const stored = localStorage.getItem('crophealth_farms_list');
      if (stored) {
        const list = JSON.parse(stored);
        if (Array.isArray(list) && list.length > 0) return list;
      }
    } catch {}
    return [];
  };

  const allFarms = [...getCustomFarms(), ...defaultFarms.filter(df => !getCustomFarms().some((cf: any) => cf.id === df.id))];

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
            <span className="hidden sm:inline">{lang === 'hi' ? 'खेत बदलें' : lang === 'mr' ? 'शेत बदला' : 'Switch'}</span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${farmDropdownOpen ? 'rotate-180 text-emerald-700' : ''}`} />
          </div>
        </button>

        {/* ============================================================= */}
        {/* DROPDOWN MENU: SWITCH OR ADD PLOT                             */}
        {/* ============================================================= */}
        {farmDropdownOpen && (
          <>
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setFarmDropdownOpen(false)} 
            />
            
            <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-xl border border-stone-200 p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150 max-h-80 overflow-y-auto">
              <div className="px-3 py-2 text-[10px] font-black uppercase tracking-wider text-stone-400 border-b border-stone-100 flex items-center justify-between">
                <span>{lang === 'hi' ? 'आपके पंजीकृत खेत व प्लॉट' : lang === 'mr' ? 'नोंदणीकृत शेत व प्लॉट' : 'Registered Farms & Plots'}</span>
                <span className="text-emerald-700 font-bold">{allFarms.length} {lang === 'hi' ? 'खेत' : lang === 'mr' ? 'शेत' : 'plots'}</span>
              </div>

              <div className="py-1 space-y-1">
                {allFarms.map((farm) => {
                  const isSelected = activeFarm?.id === farm.id;
                  const farmCropName = getLocalizedCropName(farm.crop?.name, lang);
                  const farmStageName = getLocalizedStageName(farm.crop?.stage, lang);
                  return (
                    <button
                      key={farm.id}
                      onClick={() => {
                        setActiveFarm(farm);
                        setFarmDropdownOpen(false);
                      }}
                      className={`w-full text-left p-3 rounded-xl transition-all flex items-center justify-between gap-3 ${
                        isSelected 
                          ? 'bg-emerald-50 text-emerald-950 font-bold border border-emerald-200/80 shadow-2xs' 
                          : 'hover:bg-stone-50 text-stone-800'
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="text-xs sm:text-sm font-black flex items-center gap-1.5 truncate">
                          <span>{farm.farm_name}</span>
                          {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 flex-shrink-0" />}
                        </div>
                        <div className="text-[11px] text-stone-500 font-medium flex items-center gap-2 mt-0.5">
                          <span>🌾 {farmCropName} ({farm.area_acres} {t('home_acres')})</span>
                          <span>•</span>
                          <span className="truncate">{farmStageName}</span>
                        </div>
                      </div>

                      {isSelected ? (
                        <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 shadow-2xs">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      ) : (
                        <span className="text-[11px] font-bold text-stone-400 group-hover:text-stone-700">
                          {lang === 'hi' ? 'चुनें' : lang === 'mr' ? 'निवडा' : 'Select'}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {onAddNewFarm && (
                <div className="pt-2 border-t border-stone-100">
                  <button
                    onClick={() => {
                      setFarmDropdownOpen(false);
                      onAddNewFarm();
                    }}
                    className="w-full p-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100/80 text-emerald-900 font-black text-xs transition-colors flex items-center justify-center gap-2"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>{lang === 'hi' ? '+ नया खेत जोड़ें' : lang === 'mr' ? '+ नवीन शेत जोडा' : '+ Add New Farm Plot'}</span>
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