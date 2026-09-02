import { 
  CloudSun, MapPin, ClipboardList, 
  BookOpen, ChevronRight, Sparkles
} from 'lucide-react';
import { useLang } from '@/lib/LanguageContext';
import { useFarmContext } from '@/contexts/FarmContext';

interface QuickInfoStripProps {
  onNavigateToWeather: () => void;
  onNavigateToMap: () => void;
  onNavigateToHistory: () => void;
  onNavigateToAdvisory: () => void;
}

export default function QuickInfoStrip({
  onNavigateToWeather,
  onNavigateToMap,
  onNavigateToHistory,
  onNavigateToAdvisory,
}: QuickInfoStripProps) {
  const { lang } = useLang();
  const { weather, activeFarm, activeLocation } = useFarmContext();

  const temp = weather?.current?.temperatureC ? `${weather.current.temperatureC}°C` : '28°C';
  const district = activeFarm?.district || activeLocation?.district || 'Pune';

  // Localized Labels
  const labels = {
    weather: lang === 'hi' ? 'मौसम' : lang === 'mr' ? 'हवामान' : lang === 'bn' ? 'আবহাওয়া' : 'Weather',
    myFarm: lang === 'hi' ? 'खेत नक्शा' : lang === 'mr' ? 'शेत नकाशा' : lang === 'bn' ? 'খামার' : 'Farm Map',
    history: lang === 'hi' ? 'मेरी जांच' : lang === 'mr' ? 'तपासणी' : lang === 'bn' ? 'পরীক্ষা' : 'My Checks',
    advisory: lang === 'hi' ? 'कृषि सलाह' : lang === 'mr' ? 'कृषी सल्ला' : lang === 'bn' ? 'পরামর্শ' : 'Advisories',
  };

  const subLabels = {
    weather: temp,
    myFarm: district,
    history: lang === 'hi' ? 'इतिहास' : lang === 'mr' ? 'इतिहास' : 'History',
    advisory: lang === 'hi' ? 'ICAR गाइड' : lang === 'mr' ? 'मार्गदर्शन' : 'ICAR Guide',
  };

  return (
    <div className="w-full bg-white rounded-3xl p-3.5 sm:p-5 border border-slate-200/90 shadow-sm mb-6">
      <div className="grid grid-cols-4 gap-2.5 sm:gap-4">
        
        {/* 1. Weather */}
        <button
          onClick={onNavigateToWeather}
          className="flex flex-col items-center justify-center p-2.5 sm:p-3 rounded-2xl hover:bg-amber-50/60 active:scale-95 transition-all text-center group border border-transparent hover:border-amber-200"
        >
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-100 to-amber-50 border border-amber-300/80 flex items-center justify-center text-amber-700 mb-2 group-hover:scale-105 transition-transform shadow-xs">
            <CloudSun className="w-6 h-6 stroke-[2.4]" />
          </div>
          <span className="text-xs sm:text-sm font-black text-slate-900 leading-tight">
            {labels.weather}
          </span>
          <span className="text-[11px] font-bold text-amber-700 mt-0.5 truncate max-w-full">
            {subLabels.weather}
          </span>
        </button>

        {/* 2. Farm Map */}
        <button
          onClick={onNavigateToMap}
          className="flex flex-col items-center justify-center p-2.5 sm:p-3 rounded-2xl hover:bg-emerald-50/60 active:scale-95 transition-all text-center group border border-transparent hover:border-emerald-200"
        >
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-100 to-emerald-50 border border-emerald-300/80 flex items-center justify-center text-emerald-800 mb-2 group-hover:scale-105 transition-transform shadow-xs">
            <MapPin className="w-6 h-6 stroke-[2.4]" />
          </div>
          <span className="text-xs sm:text-sm font-black text-slate-900 leading-tight">
            {labels.myFarm}
          </span>
          <span className="text-[11px] font-bold text-emerald-700 mt-0.5 truncate max-w-full">
            {subLabels.myFarm}
          </span>
        </button>

        {/* 3. My Checks History */}
        <button
          onClick={onNavigateToHistory}
          className="flex flex-col items-center justify-center p-2.5 sm:p-3 rounded-2xl hover:bg-purple-50/60 active:scale-95 transition-all text-center group border border-transparent hover:border-purple-200"
        >
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-100 to-purple-50 border border-purple-300/80 flex items-center justify-center text-purple-700 mb-2 group-hover:scale-105 transition-transform shadow-xs">
            <ClipboardList className="w-6 h-6 stroke-[2.4]" />
          </div>
          <span className="text-xs sm:text-sm font-black text-slate-900 leading-tight">
            {labels.history}
          </span>
          <span className="text-[11px] font-bold text-purple-700 mt-0.5 truncate max-w-full">
            {subLabels.history}
          </span>
        </button>

        {/* 4. Agricultural Advisories */}
        <button
          onClick={onNavigateToAdvisory}
          className="flex flex-col items-center justify-center p-2.5 sm:p-3 rounded-2xl hover:bg-teal-50/60 active:scale-95 transition-all text-center group border border-transparent hover:border-teal-200"
        >
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-teal-100 to-teal-50 border border-teal-300/80 flex items-center justify-center text-teal-800 mb-2 group-hover:scale-105 transition-transform shadow-xs">
            <BookOpen className="w-6 h-6 stroke-[2.4]" />
          </div>
          <span className="text-xs sm:text-sm font-black text-slate-900 leading-tight">
            {labels.advisory}
          </span>
          <span className="text-[11px] font-bold text-teal-700 mt-0.5 truncate max-w-full">
            {subLabels.advisory}
          </span>
        </button>

      </div>
    </div>
  );
}
