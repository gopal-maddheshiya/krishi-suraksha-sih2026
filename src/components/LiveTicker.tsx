import { AlertTriangle, CloudRain, Bug, ShieldAlert, Sparkles, ChevronRight } from 'lucide-react';
import { useLang } from '@/lib/LanguageContext';

interface LiveTickerProps {
  onNavigate: (section: string) => void;
}

export default function LiveTicker({ onNavigate }: LiveTickerProps) {
  const { lang } = useLang();

  const alerts = [
    {
      id: 1,
      type: 'pest',
      icon: Bug,
      badge: lang === 'hi' ? 'कीट अलर्ट' : 'Pest Alert',
      text: lang === 'hi' 
        ? 'कपास में गुलाबी सुंडी (पिंक बॉलवर्म) का प्रकोप - फेरोमोन ट्रैप लगाएं' 
        : 'Pink Bollworm spike in Cotton - Install pheromone traps',
      action: 'hotspots',
      color: 'bg-rose-50 text-rose-800 border-rose-200',
    },
    {
      id: 2,
      type: 'weather',
      icon: CloudRain,
      badge: lang === 'hi' ? 'मौसम अलर्ट' : 'Weather Alert',
      text: lang === 'hi'
        ? '80%+ आर्द्रता के कारण टमाटर व सोयाबीन में फंगल रस्ट का खतरा'
        : 'High humidity triggers fungal rust warning for Tomato & Soybean',
      action: 'weather',
      color: 'bg-amber-50 text-amber-800 border-amber-200',
    },
    {
      id: 3,
      type: 'hotspot',
      icon: AlertTriangle,
      badge: lang === 'hi' ? 'क्षेत्रीय हॉटस्पॉट' : 'Hotspot',
      text: lang === 'hi'
        ? 'निकटवर्ती 5 किमी क्षेत्र में 28+ नए फसल रोग मामले दर्ज'
        : '28+ verified foliar cases reported within 5km zone',
      action: 'hotspots',
      color: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    }
  ];

  return (
    <div className="w-full bg-white rounded-2xl p-2.5 sm:p-3 border border-stone-200 shadow-2xs">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2.5 text-xs">
        
        {/* Live Pulse Label */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-600"></span>
          </span>
          <span className="font-black text-[11px] text-stone-900 uppercase tracking-wider flex items-center gap-1">
            <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
            <span>{lang === 'hi' ? 'क्षेत्रीय कृषि अलर्ट' : 'Regional Alerts'}</span>
          </span>
          <span className="text-stone-300 hidden md:inline">|</span>
        </div>

        {/* Scrolling Alerts Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 w-full">
          {alerts.map((a) => {
            const Icon = a.icon;
            return (
              <button
                key={a.id}
                type="button"
                onClick={() => onNavigate(a.action)}
                className={`flex items-center gap-2 rounded-xl px-2.5 py-1.5 border text-left transition-all hover:scale-[1.01] active:scale-98 ${a.color}`}
              >
                <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="truncate text-xs font-semibold">
                  <span className="font-extrabold mr-1">[{a.badge}]</span>
                  {a.text}
                </span>
              </button>
            );
          })}
        </div>

        {/* View Map Action */}
        <button
          onClick={() => onNavigate('hotspots')}
          className="hidden lg:flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:text-emerald-800 flex-shrink-0"
        >
          <span>{lang === 'hi' ? 'पूरा नक्शा' : 'Live Map'}</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>

      </div>
    </div>
  );
}
