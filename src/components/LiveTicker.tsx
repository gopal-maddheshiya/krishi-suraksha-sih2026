import { AlertTriangle, CloudRain, Bug, ShieldAlert, Sparkles } from 'lucide-react';
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
      badge: lang === 'hi' ? 'कीट चेतावनी' : lang === 'mr' ? 'कीड इशारा' : 'Pest Alert',
      text: lang === 'hi' 
        ? 'नासिक & जलगांव: कपास में पिंक बॉलवर्म की सक्रियता बढ़ी (18+ कीट/जाल)' 
        : lang === 'mr' 
        ? 'नाशिक व जळगाव: कापूस पिकात बोंडअळीचा प्रादुर्भाव वाढला (१८+ कीटक/सापळा)'
        : 'Nashik & Jalgaon: Pink Bollworm spike in Cotton (18+ moths/trap)',
      action: 'pest'
    },
    {
      id: 2,
      type: 'weather',
      icon: CloudRain,
      badge: lang === 'hi' ? 'मौसम जोखिम' : lang === 'mr' ? 'हवामान जोखीम' : 'Weather Risk',
      text: lang === 'hi'
        ? 'विदर्भ & मराठवाड़ा: 85%+ आर्द्रता के कारण सोयाबीन में फंगल रस्ट का उच्च जोखिम'
        : lang === 'mr'
        ? 'विदर्भ व मराठवाडा: ८५%+ आर्द्रतेमुळे सोयाबीन तांबेरा रोगाचा उच्च धोका'
        : 'Vidarbha & Marathwada: 85%+ Humidity triggers Soybean Rust & Fungal alert',
      action: 'weather'
    },
    {
      id: 3,
      type: 'hotspot',
      icon: AlertTriangle,
      badge: lang === 'hi' ? 'हॉटस्पॉट' : lang === 'mr' ? 'हॉटस्पॉट' : 'Hotspot',
      text: lang === 'hi'
        ? 'पुणे & अहमदनगर: टमाटर में अर्ली ब्लाइट के 42 नए मामले दर्ज'
        : lang === 'mr'
        ? 'पुणे व अहिल्यानगर: टोमॅटो करपा रोगाची ४२ नवीन प्रकरणे नोंदवली'
        : 'Pune & Ahmednagar: 42 new Early Blight cases verified in Tomato',
      action: 'hotspots'
    }
  ];

  return (
    <div className="bg-gradient-to-r from-emerald-950 via-gray-900 to-emerald-950 text-white border-y border-emerald-800/40 py-2.5 px-4 shadow-inner overflow-hidden">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs sm:text-sm">
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="flex h-2.5 w-2.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
          </span>
          <span className="font-bold tracking-wider uppercase text-[11px] text-emerald-400 flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5" />
            {lang === 'hi' ? 'लाइव फील्ड अलर्ट्स' : lang === 'mr' ? 'थेट क्षेत्रीय इशारे' : 'Live Field Surveillance Alerts'}
          </span>
          <span className="text-emerald-600 hidden sm:inline">|</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 w-full">
          {alerts.map((a) => {
            const Icon = a.icon;
            return (
              <button
                key={a.id}
                onClick={() => onNavigate(a.action)}
                className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg px-2.5 py-1.5 text-left transition-all group"
              >
                <Icon className="w-4 h-4 text-emerald-400 flex-shrink-0 group-hover:scale-110 transition-transform" />
                <span className="truncate text-gray-200 text-xs font-normal">
                  <span className="font-semibold text-white mr-1.5">[{a.badge}]</span>
                  {a.text}
                </span>
              </button>
            );
          })}
        </div>

        <button
          onClick={() => onNavigate('hotspots')}
          className="hidden lg:flex items-center gap-1 text-xs text-emerald-300 hover:text-white font-medium flex-shrink-0 transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>{lang === 'hi' ? 'पूरा मैप देखें' : lang === 'mr' ? 'नकाशा पहा' : 'View GIS Map'} &rarr;</span>
        </button>
      </div>
    </div>
  );
}
